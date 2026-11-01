import {Series,useVideoConfig} from 'remotion';
import {getStaticFiles} from '@remotion/studio';
import {Audio} from '@remotion/media';
import {IntroV3} from './IntroV3';
import {ExperienceV3} from './ExperienceV3';
import {BridgeV3,WorkflowV3} from './WorkflowV3';
import {FinaleV3} from './FinaleV3';
import {LivePreview} from './LivePreview';
import {CodexSignature} from './CodexSignature';
import {BrowseGames,AdOpportunity} from './DiscoveryScenes';
export const Film=()=>{const {fps}=useVideoConfig();const soundtrack=getStaticFiles().find(file=>file.name==='score-v11-cat-walk.wav');return <>{soundtrack&&<Audio src={soundtrack.src} premountFor={fps}/>}<Series>
<Series.Sequence name="Real feature reveal" durationInFrames={Math.round(65*fps/30)} premountFor={fps}><IntroV3/></Series.Sequence>
<Series.Sequence name="Stream and game together" durationInFrames={Math.round(65*fps/30)} premountFor={fps}><ExperienceV3 beat={0}/></Series.Sequence>
<Series.Sequence name="The mini-games drawer" durationInFrames={Math.round(65*fps/30)} premountFor={fps}><ExperienceV3 beat={1}/></Series.Sequence>
<Series.Sequence name="Browse games" durationInFrames={4*fps} premountFor={fps}><BrowseGames/></Series.Sequence>
<Series.Sequence name="Enjoy the same stream" durationInFrames={Math.round(65*fps/30)} premountFor={fps}><ExperienceV3 beat={2}/></Series.Sequence>
<Series.Sequence name="Ad revenue concept" durationInFrames={3*fps} premountFor={fps}><AdOpportunity/></Series.Sequence>
<Series.Sequence name="Actual project · Stardew + Skyline" durationInFrames={7*fps} premountFor={fps}><LivePreview/></Series.Sequence>
<Series.Sequence name="From an idea" durationInFrames={Math.round(2.6*fps)} premountFor={fps}><BridgeV3/></Series.Sequence>
<Series.Sequence name="Shaped the idea with Codex" durationInFrames={Math.round(2.6*fps)} premountFor={fps}><WorkflowV3 step={0}/></Series.Sequence>
<Series.Sequence name="Planned every step" durationInFrames={Math.round(2.6*fps)} premountFor={fps}><WorkflowV3 step={1}/></Series.Sequence>
<Series.Sequence name="Wrote the code" durationInFrames={Math.round(2.6*fps)} premountFor={fps}><WorkflowV3 step={2}/></Series.Sequence>
<Series.Sequence name="Create this demo" durationInFrames={Math.round(104*fps/30)} premountFor={fps}><WorkflowV3 step={3}/></Series.Sequence>
<Series.Sequence name="All done with Codex only" durationInFrames={4*fps} premountFor={fps}><CodexSignature/></Series.Sequence>
<Series.Sequence name="Twitch Mini Games credits" durationInFrames={4*fps} premountFor={fps}><FinaleV3/></Series.Sequence>
</Series></>;};

