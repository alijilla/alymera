// src/app/health/page.tsx
export default async function HealthCheckPage() {
  // Simulate a server-side database fetch
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  return (
    <div className="p-10 text-center">
      <h1 className="text-2xl font-bold text-green-500">System is Healthy</h1>
      <p>Server timestamp: {new Date().toISOString()}</p>
    </div>
  );
}