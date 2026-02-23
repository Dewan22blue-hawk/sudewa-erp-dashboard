import { getAccessToken } from "./auth/token"

export function getToken(): string | null {
    return getAccessToken()
}
