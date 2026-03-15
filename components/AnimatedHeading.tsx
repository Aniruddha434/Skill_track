import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedHeading
 *
 * Renders an H-tag where each letter fades in, slides up, and unblurs
 * sequentially. Supports mixed children including plain text, <br />,
 * and <span> elements (e.g. gradient text).
 *
 * Props:
 *  - children: text content (can include <br/> and <span> with className)
 *  - as: heading tag level ('h1' | 'h2' | 'h3'), default 'h1'
 *  - className: Tailwind classes for the heading
 *  - letterDelay: ms between each letter, default 30
 *  - startDelay: ms before animation starts, default 100
 *  - mode: 'letter' for per-character, 'word' for per-word (default 'letter')
 *  - once: only animate once when in view (default true)
 */

interface AnimatedHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  className?: string;
  letterDelay?: number;
  startDelay?: number;
  mode?: 'letter' | 'word';
  once?: boolean;
}

// Recursively extract text segments from React children
interface Segment {
  type: 'text' | 'br' | 'span';
  content: string;
  className?: string;
}

function extractSegments(children: React.ReactNode): Segment[] {
  const segments: Segment[] = [];

  React.Children.forEach(children, (child) => {
    if (child === null || child === undefined) return;

    if (typeof child === 'string') {
      segments.push({ type: 'text', content: child });
    } else if (typeof child === 'number') {
      segments.push({ type: 'text', content: String(child) });
    } else if (React.isValidElement(child)) {
      if (child.type === 'br') {
        segments.push({ type: 'br', content: '' });
      } else if (child.type === 'span') {
        const props = child.props as { className?: string; children?: React.ReactNode };
        // Get text content from span children
        const innerText = getTextContent(props.children);
        segments.push({
          type: 'span',
          content: innerText,
          className: props.className || '',
        });
      } else {
        // For other elements, try to extract text
        const props = child.props as { children?: React.ReactNode };
        const inner = extractSegments(props.children);
        segments.push(...inner);
      }
    }
  });

  return segments;
}

function getTextContent(children: React.ReactNode): string {
  let text = '';
  React.Children.forEach(children, (child) => {
    if (typeof child === 'string') text += child;
    else if (typeof child === 'number') text += String(child);
    else if (React.isValidElement(child)) {
      const props = child.props as { children?: React.ReactNode };
      text += getTextContent(props.children);
    }
  });
  return text;
}

const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  children,
  as: Tag = 'h1',
  className = '',
  letterDelay = 30,
  startDelay = 100,
  mode = 'letter',
  once = true,
}) => {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && (!once || !hasAnimated.current)) {
          setIsVisible(true);
          hasAnimated.current = true;
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const segments = extractSegments(children);

  // Build the animated content
  let globalIndex = 0;

  const renderAnimated = () => {
    return segments.map((segment, segIdx) => {
      if (segment.type === 'br') {
        return <br key={`br-${segIdx}`} />;
      }

      const text = segment.content;
      const isGradient = segment.className?.includes('bg-clip-text') ||
                         segment.className?.includes('bg-gradient');

      if (mode === 'word') {
        const words = text.split(/(\s+)/);
        return words.map((word, wIdx) => {
          if (/^\s+$/.test(word)) {
            return <span key={`seg${segIdx}-ws${wIdx}`}>{word}</span>;
          }
          const delay = startDelay + globalIndex * 80;
          globalIndex++;
          const animClass = isGradient ? 'animate-letter-gradient' : 'animate-word';
          return (
            <span
              key={`seg${segIdx}-w${wIdx}`}
              className={`${isVisible ? animClass : 'opacity-0'} ${segment.type === 'span' && !isGradient ? segment.className || '' : ''}`}
              style={isVisible ? { animationDelay: `${delay}ms` } : undefined}
            >
              {word}
            </span>
          );
        });
      }

      // Letter mode
      const chars = text.split('');
      const rendered = chars.map((char, cIdx) => {
        if (char === ' ') {
          return <span key={`seg${segIdx}-c${cIdx}`}>&nbsp;</span>;
        }
        const delay = startDelay + globalIndex * letterDelay;
        globalIndex++;
        const animClass = isGradient ? 'animate-letter-gradient' : 'animate-letter';
        return (
          <span
            key={`seg${segIdx}-c${cIdx}`}
            className={`${isVisible ? animClass : 'opacity-0'}`}
            style={isVisible ? { animationDelay: `${delay}ms` } : undefined}
          >
            {char}
          </span>
        );
      });

      // Wrap span segments to preserve their styling (e.g. gradient)
      if (segment.type === 'span' && !isGradient && segment.className) {
        return (
          <span key={`seg-wrap-${segIdx}`} className={segment.className}>
            {rendered}
          </span>
        );
      }

      return <React.Fragment key={`seg-${segIdx}`}>{rendered}</React.Fragment>;
    });
  };

  return (
    <Tag
      ref={ref as any}
      className={className}
    >
      {renderAnimated()}
    </Tag>
  );
};

export default AnimatedHeading;
