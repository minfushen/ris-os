import { useState, useEffect, useCallback, useRef } from "react";

export interface RealtimeAlert {
  id: string;
  type: "gang" | "false_reject" | "psi_drift" | "throughput_drop";
  level: "high" | "medium" | "low";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface WebSocketStatus {
  connected: boolean;
  reconnecting: boolean;
  lastHeartbeat: string | null;
}

interface UseRealtimePushOptions {
  url?: string;
  onAlert?: (alert: RealtimeAlert) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseRealtimePushReturn {
  status: WebSocketStatus;
  alerts: RealtimeAlert[];
  latestAlert: RealtimeAlert | null;
  clearAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;
  reconnect: () => void;
}

const DEFAULT_WS_URL = "wss://api.example.com/risk/realtime";

export function useRealtimePush(options: UseRealtimePushOptions = {}): UseRealtimePushReturn {
  const {
    url = DEFAULT_WS_URL,
    onAlert,
    onConnect,
    onDisconnect,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [status, setStatus] = useState<WebSocketStatus>({
    connected: false,
    reconnecting: false,
    lastHeartbeat: null,
  });

  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<RealtimeAlert | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setLatestAlert(null);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    if (latestAlert?.id === alertId) {
      setLatestAlert(alerts[0] || null);
    }
  }, [alerts, latestAlert]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setStatus({
          connected: true,
          reconnecting: false,
          lastHeartbeat: new Date().toISOString(),
        });
        reconnectAttemptsRef.current = 0;
        onConnect?.();

        // 发送认证消息
        ws.send(JSON.stringify({
          type: "auth",
          token: localStorage.getItem("auth_token") || "",
        }));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "heartbeat") {
            setStatus((prev) => ({
              ...prev,
              lastHeartbeat: new Date().toISOString(),
            }));
            return;
          }

          if (message.type === "alert") {
            const alert: RealtimeAlert = {
              id: message.id || `alert-${Date.now()}`,
              type: message.alert_type,
              level: message.level,
              title: message.title,
              description: message.description,
              timestamp: message.timestamp || new Date().toISOString(),
              metadata: message.metadata,
            };

            setLatestAlert(alert);
            setAlerts((prev) => [alert, ...prev].slice(0, 50));
            onAlert?.(alert);
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };

      ws.onclose = () => {
        setStatus((prev) => ({
          ...prev,
          connected: false,
        }));
        onDisconnect?.();

        // 自动重连
        if (reconnectAttemptsRef.current < maxReconnectAttempts) {
          setStatus((prev) => ({ ...prev, reconnecting: true }));
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [url, onConnect, onDisconnect, reconnectInterval, maxReconnectAttempts, onAlert]);

  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    status,
    alerts,
    latestAlert,
    clearAlerts,
    acknowledgeAlert,
    reconnect,
  };
}

// 模拟实时推送数据（开发环境使用）
export function useMockRealtimePush(intervalMs: number = 5000): UseRealtimePushReturn {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [latestAlert, setLatestAlert] = useState<RealtimeAlert | null>(null);
  const [status] = useState<WebSocketStatus>({
    connected: true,
    reconnecting: false,
    lastHeartbeat: new Date().toISOString(),
  });

  const mockAlertTypes: RealtimeAlert["type"][] = ["gang", "false_reject", "psi_drift", "throughput_drop"];
  const mockLevels: RealtimeAlert["level"][] = ["high", "medium", "low"];

  useEffect(() => {
    const interval = setInterval(() => {
      const type = mockAlertTypes[Math.floor(Math.random() * mockAlertTypes.length)];
      const level = mockLevels[Math.floor(Math.random() * mockLevels.length)];

      const alertTemplates: Record<RealtimeAlert["type"], { title: string; description: string }> = {
        gang: {
          title: "团伙探测告警",
          description: `发现 ${Math.floor(Math.random() * 20) + 5} 个高度相似设备组`,
        },
        false_reject: {
          title: "误杀预警",
          description: `${Math.floor(Math.random() * 30) + 10}% 拒件在外部借贷成功`,
        },
        psi_drift: {
          title: "特征漂移告警",
          description: `特征 ${["多头查询", "负债率", "年龄"][Math.floor(Math.random() * 3)]} PSI 超过阈值`,
        },
        throughput_drop: {
          title: "通过率下降",
          description: `通过率较昨日下降 ${Math.floor(Math.random() * 10) + 3}%`,
        },
      };

      const alert: RealtimeAlert = {
        id: `alert-${Date.now()}`,
        type,
        level,
        title: alertTemplates[type].title,
        description: alertTemplates[type].description,
        timestamp: new Date().toISOString(),
        metadata: {
          channel: ["API-01", "API-02", "H5", "APP"][Math.floor(Math.random() * 4)],
          product: ["经营贷", "消费贷", "信用贷"][Math.floor(Math.random() * 3)],
        },
      };

      setLatestAlert(alert);
      setAlerts((prev) => [alert, ...prev].slice(0, 50));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setLatestAlert(null);
  }, []);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    if (latestAlert?.id === alertId) {
      setLatestAlert(alerts[0] || null);
    }
  }, [alerts, latestAlert]);

  const reconnect = useCallback(() => {
    // Mock: 无操作
  }, []);

  return {
    status,
    alerts,
    latestAlert,
    clearAlerts,
    acknowledgeAlert,
    reconnect,
  };
}
