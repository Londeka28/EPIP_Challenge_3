#include <Arduino.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <RadioLib.h>
#include <ArduinoJson.h>


onst char* WIFI_SSID = "Your_WiFi_Name";
const char* WIFI_PASS = "Your_WiFi_Password";
const char* MQTT_BROKER = "192.168.1.100"; // Local IP or HiveMQ broker URL

SX1276 radio = new Module(5, 26, 14);
WiFiClienr espClient;
PubSubClient mqtt(espClient);

void mqttCallback(char* topic,byte* payload, unsigned int length)
{
    String messege;
    for (int i= 0; i<length; i++) message += (char)payload[i];

    // forward MQTT command down to LoRa mesh
    radio.transmit(message);
    Serial.printIn("Fowarded Ack via LoRa" + message);

}

void setup()
{
    Serial.begin(115200)
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED)delay(500);

    mqtt.setServer(MQTT_BROKER, 1883);
    mqtt.setCallback(mqttCallback);

    radio.begin(915.0);
}

void reconnectMQTT ()
{
    while(!mqtt.connected()){
        if(mqtt.connect("GatewayNode")){
            mqtt.subscribe("emergency/confirmations");
        } else {
            delay(2000);
        }
    }
}

void loop() {
    
    if(!mqtt.connected()) reconnectMQTT();
    mqtt.loop();

    String incomingPacket;
    int state = radio.receive(incomingPacket);

    if(state== RADIOLIB_ERR_NONE){
        Serial.printIn("Received packet via LoRa: " + incomingPacket);
        mqtt.publish("emergency/confirmations", incomingPacket.c_str());
    } else if (state == RADIOLIB_ERR_RX_TIMEOUT){
        Serial.printIn("Receive timed out");
    } else if (state == RADIOLIB_ERR_CRC_MISMATCH){
        Serial.printIn("Receive failed due to CRC mismatch");
    } else {
        Serial.printIn("Receive failed, code: " + String(state));
    }