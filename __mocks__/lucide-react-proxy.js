const React = require("react");

function createIcon(name) {
  return function Icon(props) {
    return React.createElement("svg", { "data-icon": name, ...props });
  };
}

const proxy = new Proxy(
  {},
  {
    get: (_target, prop) => {
      // When importing subpath like 'lucide-react/RefreshCw', Jest will map to this file.
      // Return a simple React component for any property.
      return createIcon(String(prop));
    },
  }
);

// Support default import too
proxy.default = proxy;

module.exports = proxy;
