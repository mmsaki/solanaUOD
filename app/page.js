'use client';
import Image from 'next/image';
import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { useState } from 'react';

export default function Home() {
  // states
  const [error, setError] = useState('');

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
    const prompt = 'Is Solana price going up or down in the next 24 hours? Please give elaborate answer but start with UP or DOWN.';
    const result = await model.generateContentStream(prompt);

    let text = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text += chunkText;
    }
    console.log(text);
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

      <div className='mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left'>
        <section>
          <h2 className={`mb-3 text-2xl font-semibold rounded-lg border border-transparent px-5 py-4 transition-colors hover:dark:bg-neutral-800/30`}>
            Ask AI <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>-&gt;</span>
          </h2>
          <div className='input-container'>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`} id='response-output'>
              What do you want to know?
            </p>
            <input
              className='m-2 text-gray-400 font-base rounded-lg border px-2 py-2 transition-colors hover:dark:bg-neutral-800/3'
              onChange={() => {}}
              value={''}
              placeholder={'Write your prompt here...'}
            />
            {!error && <button>Ask me</button>}
            {error && <button>Cancel</button>}
          </div>
        </section>
      </div>
    </main>
  );
}
