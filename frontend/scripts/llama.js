import { Groq } from 'groq-sdk';

const groq = new Groq();

const chatCompletion = await groq.chat.completions.create({
  "messages": [
    {
      "role": "system",
      "content": "Build a Llama AI to Help calculate products and calories based on ingredients and to help customer for knowing how much calories is in that dessert \n"
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": ""
        },
        {
          "type": "image_url",
          "image_url": {
            "url": IMAGE_DATA_URL
          }
        }
      ]
    },
    {
      "role": "assistant",
      "content": "The image presents a screenshot of an online store's product page, featuring three dessert items. The products are displayed in a row, each with its own card.\n\n*   **Choco Revel Bar**\n    *   Image: A close-up photo of a dessert with a gooey chocolate center.\n    *   Name: Choco Revel Bar\n    *   Description: chokobar\n    *   Price: ₱100\n    *   Stock: 35\n    *   Buttons:\n        *   Ask AI\n        *   Add to Cart\n*   **Cringkles**\n    *   Image: A close-up photo of powdered sugar-coated desserts.\n    *   Name: Cringkles\n    *   Description: Cookie\n    *   Price: ₱120\n    *   Stock: 15\n    *   Button: Ask AI\n*   **Graham De leche**\n    *   Image: A photo of desserts in containers with a caramel topping.\n    *   Name: Graham De leche\n    *   Description: Soft and creamy cheese cupcakes\n    *   Price: ₱150\n    *   Stock: 40\n    *   Button: Ask AI\n\nThe image showcases three dessert products from an online store, providing details such as prices, stock availability, and buttons for customer interaction."
    },
    {
      "role": "user",
      "content": ""
    }
  ],
  "model": "meta-llama/llama-4-scout-17b-16e-instruct",
  "temperature": 1,
  "max_completion_tokens": 1024,
  "top_p": 1,
  "stream": true,
  "stop": null
});

for await (const chunk of chatCompletion) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}

