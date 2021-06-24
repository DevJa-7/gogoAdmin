class Config {
    constructor() {
        this.urls = []
        this.config = {}
        this.configReady = false

        this.BACKEND_API_URL = "http://localhost:3001/gogo/api/v1"
        this.FILE_SERVER_URL = "http://localhost:3002"
        this.WS_CENTRIFUGO = "ws://localhost:9000/connection/websocket"
    }
}

export default (new Config);