interface TextTruncateProps {
  text: string;
  maxLength: number;
  className?: string;
}

export function TextTruncate({ text, maxLength, className }: TextTruncateProps) {
  if (text.length <= maxLength) {
    return <span className={className}>{text}</span>;
  }

  return <span className={className} title={text}>{text.slice(0, maxLength)}...</span>;
}
