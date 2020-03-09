const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const chalk = require('react-dev-utils/chalk')
const PATHS = require('../constants/paths')
const PROCESS = require('../constants/process')

const validateKeyAndCerts = ({ cert, key, keyFile, crtFile }) => {
  let encrypted
  try {
    encrypted = crypto.publicEncrypt(cert, Buffer.from('test'))
  }
  catch (err) {
    throw new Error(
      `The certificate "${chalk.yellow(crtFile)}" is invalid.\n${err.message}`,
    )
  }

  try {
    crypto.privateDecrypt(key, encrypted)
  }
  catch (err) {
    throw new Error(
      `The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${
        err.message
      }`,
    )
  }
}

const readEnvFile = (file, type) => {
  if (!fs.existsSync(file)) {
    throw new Error(
      `You specified ${chalk.cyan(
        type,
      )} in your env, but the file "${chalk.yellow(file)}" can't be found.`,
    )
  }
  return fs.readFileSync(file)
}

const getHttpsConfig = () => {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = PROCESS
  const isHttps = HTTPS === 'true'

  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(PATHS.APP_PATH, SSL_CRT_FILE)
    const keyFile = path.resolve(PATHS.APP_PATH, SSL_KEY_FILE)
    const config = {
      cert: readEnvFile(crtFile, 'SSL_CRT_FILE'),
      key: readEnvFile(keyFile, 'SSL_KEY_FILE'),
    }

    validateKeyAndCerts({ ...config, keyFile, crtFile })
    return config
  }
  return isHttps
}

module.exports = getHttpsConfig
