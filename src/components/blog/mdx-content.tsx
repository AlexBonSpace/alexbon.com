import * as runtime from "react/jsx-runtime";
import type { ImgHTMLAttributes } from "react";

const sharedComponents = {
  Image: (props: ImgHTMLAttributes<HTMLImageElement>) => <img loading="lazy" decoding="async" {...props} />,
};

const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXContentProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMDXComponent(code);
  return <Component components={{ ...sharedComponents, ...components }} />;
}
