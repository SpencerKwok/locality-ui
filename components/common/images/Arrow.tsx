import * as React from "react";

function SvgArrow(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="195.87 10 608.33 980"
      {...props}
    >
      <path d="M794.6 120.8L683.9 10l-488 488 485.5 492 122.8-116.4-390.7-377.7 381.1-375.1z" />
    </svg>
  );
}

export default SvgArrow;
