"use client"
import MuxVideo from '@mux/mux-video-react';
import MediaThemeMicrovideo from 'player.style/microvideo/react';

export default function VideoPlayer(props: { playbackId: string }) {
  return (
    <div className={"min-h-[500px]"}>
      <MediaThemeMicrovideo>
        <MuxVideo
          slot="media"
          playbackId={props.playbackId}
          playsInline
          className={"min-h-[500px] bg-white"}
        ></MuxVideo>
      </MediaThemeMicrovideo>
    </div>
  );
}