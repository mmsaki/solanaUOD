'use client';
import Image from 'next/image';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { useState } from 'react';

export default function Home() {
  // states
  const [error, setError] = useState('');
  const [value, setValue] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const supriseOptions = ['How is Solana token performing in the last hour?', 'What is the best token on Solana?', 'What tokens are trending on Solana?'];

  const surpriseMe = () => {
    const randomValue = supriseOptions[Math.floor(Math.random() * supriseOptions.length)];
    setValue(randomValue);
    return randomValue;
  };

  // Initialize the Genereative Models
  if (process.env.NEXT_PUBLIC_GEMINI_API === undefined) console.error('API KEY not loaded');
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API);

  // Configure model responses
  const generationConfig = {
    stopSequences: ['red'],
    // 100 tokens correspond to roughly 60-80 words.
    // maxOutputTokens: 200,
    temperature: 0.9,
    topP: 0.1,
    topK: 16,
  };

  // use safety settings
  const safetySettings = [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];

  // gemini-pro for text only, while gemini-pro-vision is for multimodal input
  const model = genAI.getGenerativeModel({ model: 'gemini-pro', generationConfig });
  console.assert(model.model === 'models/gemini-pro', 'We only support "gemini-pro" model!');

  async function askAI() {
    // Our prompt set-up
    let prompt = value;

    if (!value) {
      setError('Error! Please ask a question');
      return;
    } else {
      setError('');
      prompt += 'Is Solana price going up or down in the next 24 hours? Please give elaborate answer but start with UP or DOWN.';
    }
    const result = await model.generateContentStream(prompt);
    console.log('💭 Sending request');

    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
    }
    setChatHistory((oldChatHistory) => [
      ...oldChatHistory,
      {
        role: 'user',
        parts: value,
      },
      {
        role: 'model',
        parts: text,
      },
    ]);

    setValue('');

    console.log(chatHistory);

    console.log('💹 Results:', text);
  }
  // askAI();

  return (
    <main className='flex min-h-screen flex-col items-center justify-between p-24'>
      <div className='z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex'>
        <p className='fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30'>
          Hey 👋, Solana UP or DOWN?
        </p>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]"></div>

      <div className='mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-1 lg:text-left'>
        <section>
          <div className='input-container'>
            <div className='flex flex gap-2 align-center p-2'>
              <p className={`m-0 max-w-[50ch] text-sm opacity-50`} id='response-output'>
                What do you want to know?
              </p>
              <button
                className={`bg-neutral-200 rounded-md px-2 border border-transparent transition-colors dark:bg-neutral-900 hover:dark:bg-neutral-800/30 cursor-pointer`}
                onClick={surpriseMe}
                disabled={!chatHistory}>
                suprise me
              </button>
            </div>
            <div className='w-full flex'>
              <input
                className='grow text-gray-400 font-base rounded-lg border px-2 py-2 transition-colors hover:dark:bg-neutral-800/3'
                onChange={(e) => setValue(e.target.value)}
                value={value}
                placeholder={'Write your prompt here...'}
              />
              <button
                className={`grow-0 mb-3 px-2 py-2 text-2xl font-semibold rounded-lg border border-transparent transition-colors hover:dark:bg-neutral-800/30 cursor-pointer`}
                onClick={() => askAI()}>
                Ask AI <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
              </button>
            </div>
          </div>
          {error && <p className='text-red-700'>{error}</p>}
          <div className='mt-10 overflow-scroll'>
            {chatHistory &&
              chatHistory.map((chatItem, index) => (
                <div key={{ index }} className='flex border rounded-m p-4'>
                  <p className={`m-0 max-w-[30ch] text-sm opacity-50`} id='answer'>
                    {chatItem.role} : {chatItem.parts}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
