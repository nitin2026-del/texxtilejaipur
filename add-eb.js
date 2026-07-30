const fs = require('fs');
const p = 'c:/Users/91787/Desktop/nitin/indithread/src/app/admin/page.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace('export default function AdminPortal()', 'function AdminPortalContent()');

const errorBoundaryCode = `
class ErrorBoundary extends React.Component<any, { hasError: boolean, error: Error | null }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 50, color: 'red', background: '#fee', zIndex: 9999, position: 'relative' }}>
          <h2>AdminPortal Client Error</h2>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminPortal() {
  return (
    <ErrorBoundary>
      <AdminPortalContent />
    </ErrorBoundary>
  );
}
`;

c += '\n' + errorBoundaryCode;

fs.writeFileSync(p, c);
console.log('Added ErrorBoundary');
