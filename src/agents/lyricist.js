/**
 * Lyricist Agent — Writes complete lyrics and audio generation prompts
 *
 * Takes: research report + brand bible + topic
 * Outputs: lyrics.md + audio-prompt.md per song
 */

import { runAgent, parseAgentJson, loadConfig } from '../shared/managed-agent.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const LYRICIST_DEF = {
  name: 'Pancake Robot Lyricist',
  noTools: true, // Pure creative writing — no web search needed
  system: `You are the head songwriter for Pancake Robot, a children's music brand for ages 4-10.

You specialize in writing songs that kids want to hear on repeat — not because parents force them to, but because kids genuinely can't stop.

Your expertise:
- Writing choruses simple enough for 3-year-olds to sing but fun enough for 10-year-olds
- Engineering earworms through repetition, rhythm, and unexpected musical moments
- Age-appropriate vocabulary (mostly 1-2 syllable words, occasional funny long word for comedy)
- Physical engagement cues that get kids moving (clap, jump, spin, stomp)
- Call-and-response structures that make kids feel like they're part of the song
- The art of the "BRIDGE" — the silly/unexpected moment that makes the song memorable

You follow the Pancake Robot brand voice and always stay within age-appropriate guardrails.
You output structured, production-ready content.`,
};

/**
 * Write lyrics and audio prompt for a song
 */
export async function writeLyrics({ songId, topic, researchReport, brandData, revisionNotes }) {
  const songDir = join(__dirname, `../../output/songs/${songId}`);
  fs.mkdirSync(songDir, { recursive: true });

  const researchSummary = researchReport
    ? JSON.stringify({
        lyric_patterns: researchReport.lyric_patterns?.slice(0, 3),
        ideal_bpm_range: researchReport.ideal_bpm_range,
        ideal_length_seconds: researchReport.ideal_length_seconds,
        viral_signals: researchReport.viral_signals?.slice(0, 5),
      }, null, 2)
    : 'No research data available. Use your expertise.';

  const brandSummary = brandData
    ? JSON.stringify({
        personality_traits: brandData.character?.personality_traits,
        catchphrases: brandData.character?.catchphrases,
        voice_tone: brandData.voice?.tone,
        formula: brandData.voice?.formula,
        replay_formula: brandData.music_dna?.replay_formula,
        always: brandData.rules?.always?.slice(0, 5),
        never: brandData.rules?.never?.slice(0, 5),
      }, null, 2)
    : 'Build a cheerful, playful Pancake Robot character who loves pancakes and adventure.';

  const revisionContext = revisionNotes
    ? `\n\nREVISION NOTES FROM BRAND REVIEW:\n${revisionNotes}\nPlease address ALL of these specific concerns.`
    : '';

  const lyricsTask = `Write a complete, production-ready children's song for the Pancake Robot brand on this topic: "${topic}"
${revisionContext}

BRAND CONTEXT:
${brandSummary}

RESEARCH INSIGHTS:
${researchSummary}

TITLE RULES — read carefully:
- The title should be creative and topic-first. Good examples: "Raining Taco Dogs", "The Counting Stomp", "Wiggle Like a Jellyfish"
- Do NOT default to "Pancake Robot [topic]" — that pattern is overused and boring
- Only include the character name "Pancake Robot" in the title if it genuinely adds humor or surprise for THIS specific topic
- A great title makes a child say "wait, WHAT?" — lean into that

LYRICS RULES:
- The character "Pancake Robot" can appear in the lyrics naturally, but is not required in every song
- Songs can be about ANY topic — animals, weather, counting, space, silly food, emotions — not always about pancakes
- What makes it a Pancake Robot song is the ENERGY, WARMTH, and SILLINESS — not constant name-dropping
- The Pancake Robot Clap (two claps before each chorus drop) and an open-ending question are always required

REQUIREMENTS:
- Total word count: 120-200 words (kids lose attention beyond this)
- Chorus: 4-6 lines MAX, must be simple enough for a 4-year-old to sing
- Chorus repeats minimum 3 times (this IS the earworm — do not compromise on repetition)
- At least ONE physical action cue per chorus (clap, jump, spin, stomp, wiggle)
- Vocabulary: mostly 1-2 syllable words; one funny long word per section for comedy effect
- Include a BRIDGE — the silly/unexpected moment that makes this song live in kids' heads
- Call-and-response element somewhere in the song

STRUCTURE REQUIRED:
[INTRO] - 1-2 lines, sets the scene
[VERSE 1] - 4-8 lines, introduces the story/concept
[CHORUS] - 4-6 lines, THE EARWORM — keep this simple and repeatable
[VERSE 2] - 4-8 lines, develops the story
[CHORUS]
[BRIDGE] - 4-6 lines, silly/unexpected twist or moment
[CHORUS x2] - repeat twice for maximum earworm effect
[OUTRO] - 1-2 lines, satisfying conclusion

Output your response as a JSON object:
{
  "title": "The Song Title",
  "lyrics": "full lyrics text with section markers like [CHORUS], [VERSE 1], etc.",
  "chorus_lines": ["line1", "line2", "line3", "line4"],
  "physical_action_cue": "description of the main physical action",
  "funny_long_word": "the comedic long word used",
  "word_count": 150,
  "key_hook": "the catchiest line in the whole song",
  "audio_prompt": {
    "style": "description of musical style",
    "tempo_bpm": 110,
    "genre": "upbeat children's pop",
    "instrumentation": "description of instruments",
    "energy": "description of energy level",
    "mood": "happy/silly/adventurous",
    "voice_style": "bright, child-friendly, energetic — match the tone and topic of the song",
    "structure_note": "intro, verse, chorus x3, verse, chorus, bridge, chorus x2, outro",
    "target_length": "~2 minutes",
    "special_notes": "any specific sound effects or musical moments"
  }
}`;

  const result = await runAgent('lyricist', LYRICIST_DEF, lyricsTask);

  let songData;
  try {
    songData = parseAgentJson(result.text);
  } catch {
    // Fallback: extract what we can
    songData = {
      title: topic.substring(0, 50),
      lyrics: result.text,
      parse_error: true,
    };
  }

  // Save lyrics.md
  const lyricsContent = formatLyricsMarkdown(songData);
  const lyricsPath = join(songDir, 'lyrics.md');
  fs.writeFileSync(lyricsPath, lyricsContent);

  // Save audio-prompt.md
  const audioPromptContent = formatAudioPrompt(songData);
  const audioPromptPath = join(songDir, 'audio-prompt.md');
  fs.writeFileSync(audioPromptPath, audioPromptContent);

  // Save raw data
  fs.writeFileSync(join(songDir, 'lyrics-data.json'), JSON.stringify(songData, null, 2));

  console.log(`\nLyrics saved to ${lyricsPath}`);
  console.log(`Audio prompt saved to ${audioPromptPath}`);

  return {
    songData,
    lyricsPath,
    audioPromptPath,
    title: songData.title || topic,
    lyricsText: lyricsContent,
    audioPromptText: audioPromptContent,
  };
}

function formatLyricsMarkdown(songData) {
  const title = songData.title || 'Untitled Song';
  const lyrics = songData.lyrics || '';

  let md = `# ${title}\n\n`;
  md += `**Key Hook:** ${songData.key_hook || 'TBD'}\n`;
  md += `**Physical Action:** ${songData.physical_action_cue || 'TBD'}\n`;
  md += `**Word Count:** ~${songData.word_count || '?'}\n\n`;
  md += `---\n\n`;
  md += lyrics;
  md += `\n`;

  return md;
}

function formatAudioPrompt(songData) {
  const ap = songData.audio_prompt || {};
  const lyrics = songData.lyrics || '';

  let prompt = `# Audio Generation Prompt\n\n`;
  prompt += `## Song: ${songData.title || 'Untitled'}\n\n`;
  prompt += `## Music Specs\n\n`;
  prompt += `**Style:** ${ap.tempo_bpm || 110} BPM, ${ap.genre || 'upbeat children\'s pop'}\n`;
  prompt += `**Instrumentation:** ${ap.instrumentation || 'bright synths, light percussion, fun sound effects'}\n`;
  prompt += `**Energy:** ${ap.energy || 'high energy, bouncy'}\n`;
  prompt += `**Mood:** ${ap.mood || 'happy, silly'}\n`;
  prompt += `**Voice Style:** ${ap.voice_style || 'bright, child-friendly, slight robotic undertone'}\n`;
  prompt += `**Structure:** ${ap.structure_note || 'intro, verse, chorus x3, verse, chorus, bridge, chorus x2, outro'}\n`;
  prompt += `**Target Length:** ${ap.target_length || '~2 minutes'}\n`;
  if (ap.special_notes) {
    prompt += `**Special Notes:** ${ap.special_notes}\n`;
  }
  prompt += `\n---\n\n`;
  prompt += `## Full Lyrics\n\n`;
  prompt += lyrics;
  prompt += `\n`;

  return prompt;
}
