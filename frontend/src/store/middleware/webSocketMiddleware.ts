import { Middleware } from "@reduxjs/toolkit";
import { MARKET_UPDATE_FUTURES_INDICES, UPDATE_KLINES_BTC, UPDATE_KLINES_ETH } from "../actions/actionTypes";
import { WEBSOCKET_API } from "@/utils/apis";

export const webSocketMiddleware: Middleware = (storeAPI) => (next) => (action) => {
    let socket: WebSocket | null = null;

    if (action.type === 'app/startWebSocket') {
        // Assuming you dispatch an action to start WebSocket connection
        socket = new WebSocket(WEBSOCKET_API);

        socket.onopen = () => {
            console.log('WebSocket connected');
        };

        socket.onmessage = (message) => {
            const result = JSON.parse(message.data);

            if (result.event === 'futuresIndices') {
                const data = {
                    'data': result.data,
                    'lastUpdatedAt': result.timestamp
                }

                storeAPI.dispatch({
                    type: MARKET_UPDATE_FUTURES_INDICES,
                    payload: data
                });

                return;
            } else if (result.event === 'klines') {
                if (result.symbol === 'BTCUSDC') {
                    storeAPI.dispatch({
                        type: UPDATE_KLINES_BTC,
                        payload: result.data
                    });
                } else if (result.symbol === 'ETHUSDC') {
                    storeAPI.dispatch({
                        type: UPDATE_KLINES_ETH,
                        payload: result.data
                    });
                }

                return;
            }
        };

        socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        socket.onclose = () => {
            console.log('WebSocket disconnected');
            socket = null;
        };
    }

    if (action.type === 'app/stopWebSocket' && socket) {
        socket.close();
    }

    // Continue processing this action down the chain
    return next(action);
};