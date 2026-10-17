declare module 'react-markdown' {
  import type { FC } from 'react';

  const ReactMarkdown: FC<{ children?: string; className?: string }>;
  export default ReactMarkdown;
}
