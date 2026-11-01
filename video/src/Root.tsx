import {Composition,Folder} from 'remotion';
import {Film} from './Film';
import {IntroV3} from './IntroV3';
import {ExperienceV3} from './ExperienceV3';
import {BridgeV3,WorkflowV3} from './WorkflowV3';
import {FinaleV3} from './FinaleV3';
import {LivePreview} from './LivePreview';
import {CodexSignature} from './CodexSignature';
import {BrowseGames,AdOpportunity} from './DiscoveryScenes';
import {Thumbnail} from './Thumbnail';
export const RemotionRoot=()=> <>
<Composition id="Sidequest" component={Film} durationInFrames={1336} fps={30} width={1920} height={1080}/>
<Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={30} width={1920} height={1080}/>
<Folder name="Designed-scenes">
<Composition id="Browse-games" component={BrowseGames} durationInFrames={120} fps={30} width={1920} height={1080}/>
<Composition id="Ad-revenue-concept" component={AdOpportunity} durationInFrames={90} fps={30} width={1920} height={1080}/>
<Composition id="Actual-project-preview" component={LivePreview} durationInFrames={210} fps={30} width={1920} height={1080}/>
<Composition id="Real-reveal" component={IntroV3} durationInFrames={65} fps={30} width={1920} height={1080}/>
<Composition id="Together" component={ExperienceV3} defaultProps={{beat:0}} durationInFrames={65} fps={30} width={1920} height={1080}/>
<Composition id="Mini-games-drawer" component={ExperienceV3} defaultProps={{beat:1}} durationInFrames={65} fps={30} width={1920} height={1080}/>
<Composition id="Same-stream" component={ExperienceV3} defaultProps={{beat:2}} durationInFrames={65} fps={30} width={1920} height={1080}/>
<Composition id="From-an-idea" component={BridgeV3} durationInFrames={78} fps={30} width={1920} height={1080}/>
<Composition id="Codex-idea" component={WorkflowV3} defaultProps={{step:0}} durationInFrames={78} fps={30} width={1920} height={1080}/>
<Composition id="Codex-plan" component={WorkflowV3} defaultProps={{step:1}} durationInFrames={78} fps={30} width={1920} height={1080}/>
<Composition id="Codex-code" component={WorkflowV3} defaultProps={{step:2}} durationInFrames={78} fps={30} width={1920} height={1080}/>
<Composition id="Codex-Remotion" component={WorkflowV3} defaultProps={{step:3}} durationInFrames={104} fps={30} width={1920} height={1080}/>
<Composition id="Codex-signature" component={CodexSignature} durationInFrames={120} fps={30} width={1920} height={1080}/>
<Composition id="Final-credits" component={FinaleV3} durationInFrames={120} fps={30} width={1920} height={1080}/>
</Folder></>;

