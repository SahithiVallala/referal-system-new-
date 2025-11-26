import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings, 
  SkipBack, 
  SkipForward,
  Minimize
} from "lucide-react";

interface VideoPlayerProps {
  title: string;
  instructor: string;
  duration: string;
  currentTime?: string;
  thumbnail?: string;
  onClose?: () => void;
}

export function VideoPlayer({ 
  title, 
  instructor, 
  duration, 
  currentTime = "0:00",
  thumbnail = "https://images.unsplash.com/photo-1565229284535-2cbbe3049123?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2RpbmclMjBwcm9ncmFtbWluZyUyMGNvdXJzZXxlbnwxfHx8fDE3NTk1MTA2Nzl8MA&ixlib=rb-4.1.0&q=80&w=1080",
  onClose
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState([25]);
  const [volume, setVolume] = useState([80]);
  
  const videoRef = useRef<HTMLDivElement>(null);
  let hideControlsTimeout: NodeJS.Timeout;

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => clearTimeout(hideControlsTimeout);
  }, []);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const toggleMute = () => setIsMuted(!isMuted);
  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

  return (
    <Card className={`relative overflow-hidden bg-black ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
      <div 
        ref={videoRef}
        className="relative aspect-video bg-black cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video Thumbnail/Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Play Button Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              onClick={togglePlay}
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </Button>
          </div>
        )}

        {/* Video Controls */}
        <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={progress}
              onValueChange={setProgress}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="w-4 h-4" />
              </Button>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                
                <div className="w-20">
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
              </div>

              <span className="text-white text-sm ml-4">
                {currentTime} / {duration}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                <Settings className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </Button>

              {onClose && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  onClick={onClose}
                >
                  ×
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Video Info Overlay */}
        {showControls && (
          <div className="absolute top-4 left-4 right-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-white text-lg font-medium mb-1">{title}</h3>
                <p className="text-white/80 text-sm">{instructor}</p>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                HD
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}