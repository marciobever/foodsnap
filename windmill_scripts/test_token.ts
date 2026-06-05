import * as wmill from "windmill-client";

async function testToken() {
    try {
        const META_ACCESS_TOKEN = await wmill.getVariable("u/bevervansomarcio/META_ACCESS_TOKEN");
        const META_PHONE_NUMBER_ID = await wmill.getVariable("u/bevervansomarcio/META_PHONE_NUMBER_ID");
        
        console.log("Token length:", META_ACCESS_TOKEN?.length);
        console.log("Phone ID:", META_PHONE_NUMBER_ID);
        
        const url = `https://graph.facebook.com/v19.0/${META_PHONE_NUMBER_ID}/messages`;
        console.log("Testing URL:", url);
        
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: "5511999999999", // Dummy number
            type: "text",
            text: { body: "Test" }
        };

        const res = await fetch(url, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json", 
                "Authorization": `Bearer ${META_ACCESS_TOKEN}` 
            },
            body: JSON.stringify(payload)
        });

        const text = await res.text();
        console.log("Response:", res.status, text);
    } catch (e) {
        console.error(e);
    }
}

testToken();
