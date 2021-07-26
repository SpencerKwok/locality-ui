import * as React from "react";

function SvgStepArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={42}
      height={46}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M38 16.072c5.333 3.079 5.333 10.777 0 13.856L12.5 44.651c-5.333 3.079-12-.77-12-6.929V8.278c0-6.159 6.667-10.008 12-6.929L38 16.072z"
        fill="#FEF6E4"
      />
    </svg>
  );
}

export default SvgStepArrow;
