export function InvalidTokenError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-600">Invalid Submission Token</h1>
        <p className="text-gray-600 mb-4">
          The submission link you&apos;re trying to access is either invalid or has expired.
        </p>
        <p className="text-sm text-gray-500">
          Please check your submission link or contact the event organizer for assistance.
        </p>
      </div>
    </div>
  )
}