import { GoogleAuth } from "google-auth-library";
import { google } from "googleapis";
  
const auth = new GoogleAuth({
  scopes: 'https://www.googleapis.com/auth/spreadsheets',
  credentials: {
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQD6oJF2IvwgsdFY\nDc4/5WOCpRC1ZbF2ts1Agzf9ugTUfhOoV6assQ7Dd+kU6hvRRuHl7J8Czw/OFLNt\nzWAjgczp9kuVKm6eQK073YYQa2oBbyLCwwOKbjMnP2Fg1IAR3TvysmrTFtxqMeWL\nTUzTwh7DKuQWsKVkhZs9SyFScMdQMtvDEUAJWhGLCZjRrqGj7NkVkoke+T4MlLPR\ntN+dmDr3ZcSIDpy4pTfQ2GJUmpba/DxnhWlBVkNgQPh912MPpIjodCfXAlU/ukue\nTLiz+ce8iJvCc7z5cLxfY0qtygEprQT6UCuirDGyXsOt4J1mj23rIxF6IEC1NokQ\nKbJU5ZI/AgMBAAECggEAE+pLGhUWQyQoxhN1bn8Jf5R4QGx6mTwAu/3xUWMaW9GX\njvVFaaGO0m971k1ICpgpqSiP9hwtXasoGt3f+Xz9+HVkH3qbXE3ith1t4sN2TUjf\nJ+obz5Xe0LaTmVXUG2ygr9yyP7XTAUlCZpBXk4LFs60mf2W9WWsty8Vlj3R7Z17g\nStQIfauiRgh648nihUYCF238QU9IQ5yM6LwxnxzE1zb58HoT3DK9qlwCrKu13Q4E\nkUoaUdPLXFuM4Br9EVXwJOIywCbx9SlK+fP8DAvl1SKF8lbfT6b2/pcvWgGuSvAl\nnb/DxVwtgcCdw0Sjycu44yladMAqfDasz9KI2ttUWQKBgQD9ZApY2Net2SWRPcbx\nhcyKNxl5es72Ii6FiiiVPfGufJ9ASGrziT7mjcqFCNaoRd3cMP/TMb+sYKihSGcB\nqXhILyESmLjLw3MQW7EGO/4NjMS2s0LWLGiPiBImQ0jy+2YUNdl90M6aJsuCLOh7\nHmCTuu04z+6gij2YNLCzSp3c+wKBgQD9NT4oXx8kP3ZcejCfqIN5peNOwyyL+Ojy\n8qFUQXsgvebjUJkbqUhezuzpC0iVfIdps6mKRC6YK7X4vlGZTxWmMgYrEZnXBO0N\nUV+9i04jkGBk9adsSf7BDw27kYBebQOl+FLAYQzB+OWvdc6TdKmdurXOy5dF/i5s\nf61VOmnUjQKBgBEntb+gJrIBcparvQ1bBqcQ5eugkeR+GfI2kVrRT8yFaW67uGn2\nj8iiLuTk3UuVN1kSBC/zPUvZW3FX6ollRNx2PGH67v/0opSn8ItAgom+Tw8jgdHo\nPcgB6WCny4eP17BkmO34thQfrkWI7tBvFRDLZgYjpb8+vL7SSmhJE/kDAoGAQpy0\nKnjDv4x2feOjUQ1K8UDD6N+No5Eq72cHLBxB4R40VI7KiK1jHZYAW1qdkL3+/b7H\nFlnTjDLLn5Gp89QLVPqKBuCNgTSJjFxg/INeXhrIUScTEXjx7SYhrbuccrrpH8uR\nMY0Whx0Mh7lNTBt/17/bvnhu5nn1CpQYLHi+iK0CgYEAmJWF1P+EqYGkK3K3fXt7\nrBL0FhYPCVm2cUntk3In9d2q7qdFL7q3N+QAWevyXz84zHda8Gi8tCa9nYGNNeEg\n/8qhbbfmFlQ0XN2O8b0AZ0p4SPUFdxdcTz5x3n5bnswrStynbTaLu6lMkad/rUDk\n3YwiH47MME2psLpLJrtzMUM=\n-----END PRIVATE KEY-----\n",
    "client_email": "moby-sheets-writer@moby-production-419202.iam.gserviceaccount.com",
  },
})

export const appendValues = async (range, values) => {

  const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
  
  const service = google.sheets({version: 'v4', auth});
  const resource = { values }

  try {
    const result = await service.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: resource,
    })

    console.log(`${result.data.updates.updatedCells} cells appended.`);
    return result;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }
}