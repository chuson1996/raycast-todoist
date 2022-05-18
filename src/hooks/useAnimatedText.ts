import { useEffect, useState } from "react";

export default function useAnimatedText(text: string) {
  const [str, setStr] = useState('');
  const words = text.split(' ');

  useEffect(() => {
    let i = 1;
    const _interval = setInterval(() => {
      setStr(words.slice(0, i).join(' '))
      i++;
      if (i >= words.length) {
        clearInterval(_interval);
      }
    }, 50)

    return () => {
      clearInterval(_interval);
      i = 0;
    }
  }, [text])

  return str;
}