import { Link } from '@tanstack/react-router'

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm py-4 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center space-x-4">
          <span className="text-sm text-gray-300">Ⓡ</span>
          <Link to="/terms" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            이용약관
          </Link>
          <span className="text-xs text-gray-300">·</span>
          <Link to="/privacy" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            개인정보처리방침
          </Link>
        </div>
      </div>
    </footer>
  );
}