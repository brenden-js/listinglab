"use client"
import MuxVideo from '@mux/mux-video-react';
import MediaThemeMicrovideo from 'player.style/microvideo/react';

export default function VideoPlayer(props: { playbackId: string }) {
  return (
    <div className={"md:min-h-[500px]"}>
      <MediaThemeMicrovideo>
        <MuxVideo
          slot="media"
          playbackId={props.playbackId}
          playsInline
          className={"md:min-h-[500px]"}
        ></MuxVideo>
      </MediaThemeMicrovideo>
    </div>
  );
}