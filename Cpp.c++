# include <WiFi.h>
#include <HTTPClient.h>
-0
const char* ssid = "YourWiFi";
const char* password = "YourPassword";
String serverName = "http://your-server-ip:5000/api/alerts";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting...");
  }
  Serial.println("Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    String payload = "{\"type\":\"Medical\",\"location\":\"-29.8587,31.0218\",\"details\":\"Heart attack\"}";
    int httpResponseCode = http.POST(payload);
    Serial.println(httpResponseCode);
    http.end();
  }
  delay(60000);
}
