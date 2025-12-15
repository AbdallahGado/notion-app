/* eslint-disable @typescript-eslint/no-require-imports */
require("whatwg-fetch");
require("@testing-library/jest-dom");
// Mock lucide-react icons to simple SVG components for tests
const React = require("react");
jest.mock("lucide-react", () => {
  const createIcon = (name) => (props) =>
    React.createElement("svg", { "data-icon": name, ...props });
  return new Proxy(
    {},
    {
      get: (_target, prop) => createIcon(prop),
    }
  );
});
