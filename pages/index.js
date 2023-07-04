import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import styles from './index.module.css'

export default function Home() {
  const bottomRef = useRef(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])

  //set the first message on load
  useEffect(() => {
    setMessages([{ name: 'AI', message: getGreeting() }])
  }, [0])

  //scroll to the bottom of the chat for new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function getGreeting() {
    const greetings = [
      '안녕하세요! 와우독스입니다. 강아지의 건강과 관련해서 궁금한 점이 있으신가요? 저는 강아지의 건강과 행복을 위해 도움을 드릴 수 있어 기쁩니다. 어떤 부분에 대해 물어보고 싶으신가요?',
      '안녕하세요! 오늘은 강아지에 관한 궁금증이 있으신가요? 제가 알고 있는 선에서 강아지 관련 정보를 제공해 드릴게요. 무엇을 알고 싶으신가요?',
      '안녕하세요! 강아지에 관심이 있으신가요? 저는 강아지의 행동, 훈련, 사료 등에 대해 알고 있는 한에서 도움을 드릴 수 있어요. 어떤 부분에 대해 알고 싶으신가요?',
      '안녕하세요! 강아지에 대해 어떤 것을 알고 싶으신가요? 제가 알고 있는 한에서 강아지 관련 정보를 제공하도록 하겠습니다.',
      '안녕하세요! 강아지에 관련된 궁금한 점이 있으신가요? 와우독스는 강아지에 대한 정보와 조언을 제공하기 위해 여기에 있습니다. 어떤 부분에 대해 궁금하신가요?'
    ]
    const index = Math.floor(greetings.length * Math.random())
    return greetings[index]
  }

  async function onSubmit(event) {
    event.preventDefault()

    //start AI message before call
    //this is a hack, the state doesn't update before the api call,
    //so I reconstruct the messages
    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { name: '나', message: chatInput },
        { name: 'AI', message: '' },
      ]
      return newMessages
    })

    const sentInput = chatInput
    setChatInput('')

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: [...messages, { name: 'Me', message: sentInput }],
      }),
    })

    if (!response.ok) {
      alert('Please enter a valid input')
      return
    }

    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    //stream in the response
    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      const chunkValue = decoder.decode(value)

      setMessages((prevMessages) => {
        const lastMsg = prevMessages.pop()
        const newMessages = [
          ...prevMessages,
          { name: lastMsg.name, message: lastMsg.message + chunkValue },
        ]
        return newMessages
      })
    }
  }

  const messageElements = messages.map((m, i) => {
    return (
      <div
        style={{
          background: m.name === 'AI' ? 'none' : 'rgb(0 156 23 / 20%)',
        }}
        key={i}
        className={styles.message}
      >
        <div className={styles.messageName}>{m.name}</div>
        <div className={styles.messageContent}> {m.message}</div>
      </div>
    )
  })

  return (
    <div>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
          margin: 0px;
        }
      `}</style>
      <Head>
        <title>강아지 전문봇 와우독스</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />

        <link
          href="https://cdn.jsdelivr.net/npm/comic-mono@0.0.1/index.min.css"
          rel="stylesheet"
        />
      </Head>

      <main className={styles.main}>
        <div className={styles.icon}></div>

        <h3>  😸 강아지 전문봇 WowDogs </h3>
        <div className={styles.chat}>
          <div className={styles.chatDisplay}>
            {messageElements}

            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="chat"
              placeholder="🤗우리 강아지는 어디가 아픈가요?"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value)
              }}
            />
            <input type="submit" value="질문하기" />
          </form>
        </div>

        <div className={styles.footer}>
  made by <a href="https://jk2023-creator.github.io">JK & website</a>

  <div className={styles.footerImages}>
    <a href="https://jk2023.tistory.com">
      <img src="/images/tistory.png" alt="Tistory" />
    </a>

    <a href="https://www.instagram.com/jk2023.creator/">
      <img src="/images/instagram.png" alt="Instagram" />
    </a>

    <a href="https://www.youtube.com/@JK2023.creator">
      <img src="/images/youtube.png" alt="YouTube" />
    </a>
  </div>
</div>

      </main>
    </div>
  )
}


