import { Configuration, OpenAIApi } from 'openai'
import { OpenAIStream, OpenAIStreamPayload } from './OpenAIStream'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export const config = {
  runtime: 'edge',
}

const pre_prompt = `role is as a dog specialist and you respond in a very friendly and detailed manner. 
You provide thorough answers within a limit of 300 tokens. If asked about personal matters or anything unrelated to dogs, you decline politely and wittily. 

"Hello there! I'm WoofDogs, your dedicated dog expert. I'm here to assist you with any questions or concerns you may have about your furry friend.
 Feel free to ask away! But before we start, let's remember to keep our focus on dogs. If the topic veers off into unrelated territory, I'll gracefully steer us back.
 Now, let's dive into the wonderful world of dogs, all within 300 tokens or less."`;

// no api calls while testing
const testing = false

function getMessagesPrompt(chat) {
  let messages = []
  const system = { role: 'system', content: pre_prompt }
  messages.push(system)

  chat.map((message) => {
    const role = message.name == 'Me' ? 'user' : 'assistant'
    const m = { role: role, content: message.message }
    messages.push(m)
  })

  return messages
}

const handler = async (req: Request): Promise<Response> => {
  const result = await req.json()
  const chat = result.chat
  const message = chat.slice(-1)[0].message

  if (message.trim().length === 0) {
    return new Response('Need enter a valid input', { status: 400 })
  }

  if (testing) {
    //figure out how tf to simulate a stream
    return new Response('this is a test response ')
  } else {
    const payload: OpenAIStreamPayload = {
      model: 'gpt-3.5-turbo-16k',
      messages: getMessagesPrompt(chat),
      temperature: 0.9,
      presence_penalty: 0.6,
      max_tokens: 500,
      stream: true,
    }
    const stream = await OpenAIStream(payload)
    return new Response(stream)
  }
}

export default handler
