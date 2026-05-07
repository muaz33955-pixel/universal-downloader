"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<any>(null);
  const [error, setError] = useState("");
  
  const [selectedFormat, setSelectedFormat] = useState("");
  const [downloading, setDownloading] = useState(false);

  // --- Loading Spinner Component ---
  const Spinner = () => (
    <div style={{
      border: '3px solid rgba(255,255,255,0.3)',
      borderTop: '3px solid white',
      borderRadius: '50%',
      width: '18px',
      height: '18px',
      animation: 'spin 0.8s linear infinite',
      marginRight: '10px'
    }} />
  );

  const handleFetchInfo = async () => {
    if (!url) {
      setError("Please enter a URL first!");
      return;
    }
    
    setLoading(true);
    setError("");
    setVideoInfo(null);
    setSelectedFormat("");
    
    try {
      const res = await fetch(`/api/video-info?url=${encodeURIComponent(url)}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to fetch media info. Link check karein!");

      setVideoInfo(data);
      if (data.formats && data.formats.length > 0) {
        setSelectedFormat(data.formats[0].format_id); // Sorted data hone ki wajah se best format khud select ho jayega
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (type: 'video' | 'audio') => {
    if (!url || !selectedFormat) return;
    
    setDownloading(true);
    setError("");

    try {
      const isAudio = type === 'audio';
      const res = await fetch(`/api/download?url=${encodeURIComponent(url)}&format=${selectedFormat}&audio=${isAudio}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Download failed. Please try again.");

      window.location.href = data.downloadUrl;
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <main 
      style={{ 
        backgroundColor: '#f3f4f6', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px',
        fontFamily: 'sans-serif'
      }}
    >
      {/* Global CSS for Spinner Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Universal Downloader Main Card */}
      <div 
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          backgroundColor: 'white', 
          borderRadius: '20px', 
          padding: '40px', 
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}
      >
        
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#1d4ed8', margin: '0', textTransform: 'uppercase', letterSpacing: '-1px' }}>
            Universal Downloader
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
            Download from YouTube, Facebook, Instagram & more
          </p>
        </div>

        {/* Input Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input
            type="text"
            placeholder="Paste Video Link Here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '15px', 
              borderRadius: '10px', 
              border: '2px solid #d1d5db', 
              outline: 'none', 
              color: 'black',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />

          <button
            onClick={handleFetchInfo}
            disabled={loading || downloading}
            style={{ 
              backgroundColor: '#2563eb', 
              color: 'white', 
              padding: '15px', 
              borderRadius: '10px', 
              fontWeight: 'bold', 
              border: 'none', 
              cursor: 'pointer', 
              fontSize: '16px',
              opacity: loading ? 0.7 : 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            {loading && <Spinner />}
            {loading ? "SEARCHING..." : "GET MEDIA INFO"}
          </button>
          
          {error && <p style={{ color: '#dc2626', textAlign: 'center', fontSize: '13px', fontWeight: 'bold' }}>{error}</p>}
        </div>

        {/* Results Area */}
        {videoInfo && (
          <div style={{ marginTop: '30px', paddingTop: '30px', borderTop: '2px solid #f3f4f6' }}>
            
            <img 
              src={videoInfo.thumbnail} 
              alt="Thumbnail" 
              style={{ width: '100%', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} 
            />
            
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827', textAlign: 'center', marginBottom: '20px' }}>
              {videoInfo.title}
            </h2>
            
            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Select Quality (for Video):
              </label>
              <select 
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', color: 'black', backgroundColor: '#f9fafb', fontWeight: '600' }}
              >
                {videoInfo.formats.map((format: any, idx: number) => (
                  <option key={idx} value={format.format_id}>
                    {format.resolution} ({format.fps} FPS)
                  </option>
                ))}
              </select>
            </div>
            
            {/* TWO DOWNLOAD BUTTONS WITH SPINNERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button 
                onClick={() => handleDownload('video')}
                disabled={downloading}
                style={{ 
                  backgroundColor: '#16a34a', 
                  color: 'white', 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  fontWeight: '900', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(22, 163, 74, 0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {downloading && <Spinner />}
                {downloading ? "PROCESSING..." : "DOWNLOAD VIDEO (MP4)"}
              </button>

              <button 
                onClick={() => handleDownload('audio')}
                disabled={downloading}
                style={{ 
                  backgroundColor: '#9333ea', 
                  color: 'white', 
                  width: '100%', 
                  padding: '16px', 
                  borderRadius: '12px', 
                  fontWeight: '900', 
                  border: 'none', 
                  cursor: 'pointer', 
                  fontSize: '16px',
                  boxShadow: '0 4px 10px rgba(147, 51, 234, 0.3)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                {downloading && <Spinner />}
                {downloading ? "CONVERTING..." : "DOWNLOAD AUDIO (MP3)"}
              </button>
            </div>
            
          </div>
        )}
      </div>

      <footer style={{ marginTop: '40px', color: '#9ca3af', fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px' }}>
        © 2026 UNIVERSAL DOWNLOADER SYSTEM
      </footer>
    </main>
  );
}