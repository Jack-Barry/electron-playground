import * as keytar from 'keytar'
import { constants, RegisteredKeychainAccountName } from '../constants'

export const setStoredPassword = async (
  accountName: RegisteredKeychainAccountName,
  value: string
): Promise<void> => {
  return keytar.setPassword(constants.appName, accountName, value)
}

export const getStoredPassword = async (
  accountName: RegisteredKeychainAccountName
): Promise<string | null> => {
  return keytar.getPassword(constants.appName, accountName)
}

export const removeStoredPassword = async (
  accountName: RegisteredKeychainAccountName
): Promise<boolean> => {
  return keytar.deletePassword(constants.appName, accountName)
}
