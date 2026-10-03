import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/index.js';

export interface Persona {
  id: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
  background: string;
  speaking_style: string;
  system_prompt: string;
  created_at: string;
}

const MALE_NAMES = [
  '田中太郎', '鈴木一郎', '佐藤健', '山田大輔', '伊藤翔太',
  '渡辺直人', '高橋誠', '中村光', '小林隆', '加藤正義',
  '吉田拓海', '山口蓮', '松本龍之介', '井上大地', '木村陽介',
];
const FEMALE_NAMES = [
  '佐藤花子', '鈴木美咲', '田中さくら', '山田優子', '伊藤恵',
  '渡辺真由', '高橋結衣', '中村美月', '小林あかり', '加藤千尋',
  '吉田凛', '山口葵', '松本七海', '井上彩花', '木村美穂',
];

const OCCUPATIONS = [
  { title: '高校教師', context: '地元の高校で国語を教えている' },
  { title: 'ITエンジニア', context: 'Web系のスタートアップ企業でバックエンド開発をしている' },
  { title: '看護師', context: '大学病院の外科病棟で勤務している' },
  { title: 'カフェ店員', context: '駅前の個人経営カフェでバリスタとして働いている' },
  { title: '公務員', context: '市役所の住民課で窓口業務を担当している' },
  { title: '大学生', context: '文学部の3年生で、近代文学を専攻している' },
  { title: '主婦/主夫', context: '小学生の子供2人の育児をしながら家事をこなしている' },
  { title: 'フリーランスデザイナー', context: '自宅でWebデザインやロゴデザインの仕事を請けている' },
  { title: '営業職', context: '大手メーカーで法人営業を担当している' },
  { title: '料理人', context: '和食レストランで板前として10年の経験がある' },
  { title: '農家', context: '地方で米と野菜を有機栽培している' },
  { title: '引退した会社員', context: '商社に40年勤め、定年退職後は趣味の園芸を楽しんでいる' },
  { title: '美容師', context: '繁華街の美容室でスタイリストとして活躍している' },
  { title: 'タクシードライバー', context: '都市部でタクシーを運転して15年になる' },
  { title: '薬剤師', context: 'ドラッグストアで処方箋調剤と健康相談を行っている' },
  { title: '保育士', context: '認可保育園で0〜2歳児クラスを担当している' },
  { title: 'ミュージシャン', context: 'ライブハウスを中心に活動するインディーズバンドのギタリスト' },
  { title: '建設作業員', context: 'ビルの建築現場で鉄筋工として働いている' },
  { title: '図書館司書', context: '公立図書館で資料管理と読書相談を行っている' },
  { title: '介護福祉士', context: '特別養護老人ホームで入居者のケアを担当している' },
];

const PERSONALITIES = [
  { trait: '明るく社交的', detail: '誰とでもすぐに打ち解けられる性格。話題が豊富で場を盛り上げるのが得意' },
  { trait: '穏やかで思慮深い', detail: '落ち着いた性格で、物事をよく考えてから発言する。相手の話をじっくり聞くタイプ' },
  { trait: 'まじめで几帳面', detail: '規則やマナーを重んじる性格。物事を計画的に進めるのが好き' },
  { trait: 'おっとりしてマイペース', detail: '急がず焦らず、自分のペースを大切にする。少し天然な部分もある' },
  { trait: '情熱的でエネルギッシュ', detail: '興味のあることには全力で取り組む。時に熱くなりすぎることもある' },
  { trait: '心配性で慎重', detail: 'リスクをよく考え、石橋を叩いて渡るタイプ。細かいことに気がつく' },
  { trait: 'ユーモアがあって楽天的', detail: '困難な状況でも前向きに捉え、ジョークで場を和ませるのが好き' },
  { trait: '寡黙だが芯が強い', detail: 'あまり多くを語らないが、自分の意見はしっかり持っている。信頼できる人にだけ心を開く' },
  { trait: 'お節介で面倒見がいい', detail: '困っている人を放っておけない性格。ついつい助言をしたくなる' },
  { trait: '好奇心旺盛で新しいもの好き', detail: '新しいことに挑戦するのが大好き。流行に敏感でいろいろ試したがる' },
  { trait: '頑固で職人気質', detail: '自分のこだわりが強く、妥協を許さない。仕事に対するプライドが高い' },
  { trait: 'おしゃべり好きで噂好き', detail: '近所の話題や芸能ニュースに詳しい。会話が途切れることがない' },
];

const SPEAKING_STYLES = [
  { style: '丁寧語中心', example: '〜です、〜ます を基本とし、礼儀正しく話す' },
  { style: 'カジュアルなタメ口', example: '〜だよね、〜じゃん、など友達感覚で話す' },
  { style: '方言混じり（関西弁）', example: '〜やねん、〜やろ、ほんまに、など関西風の表現を使う' },
  { style: '方言混じり（東北弁）', example: '〜だべ、〜んだ、など東北風の表現を使う' },
  { style: '少し古風な言い回し', example: '〜でございます、〜ではありませんか、など格式高い表現を使う' },
  { style: '若者言葉多め', example: 'マジ、ヤバい、それな、ワンチャン、など若者特有の表現を使う' },
  { style: 'ゆっくり穏やかな口調', example: '〜ですねぇ、〜かしら、と穏やかでゆったりとした話し方' },
  { style: 'テキパキした口調', example: '短文で端的に話す。要点を先に言う癖がある' },
];

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAge(): number {
  const ranges = [
    { min: 18, max: 25, weight: 2 },
    { min: 26, max: 35, weight: 3 },
    { min: 36, max: 50, weight: 3 },
    { min: 51, max: 65, weight: 2 },
    { min: 66, max: 80, weight: 1 },
  ];
  const totalWeight = ranges.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const range of ranges) {
    rand -= range.weight;
    if (rand <= 0) {
      return range.min + Math.floor(Math.random() * (range.max - range.min + 1));
    }
  }
  return 30;
}

export function generatePersona(): Persona {
  const gender = Math.random() < 0.5 ? '男性' : '女性';
  const name = randomItem(gender === '男性' ? MALE_NAMES : FEMALE_NAMES);
  const age = randomAge();
  const occupation = randomItem(OCCUPATIONS);
  const personality = randomItem(PERSONALITIES);
  const speakingStyle = randomItem(SPEAKING_STYLES);

  const backgrounds = [
    `${age >= 30 ? '地方出身で、大学進学を機に都会に出てきた。' : '都会生まれ都会育ち。'}`,
    `趣味は${randomItem(['読書', '映画鑑賞', '散歩', '料理', 'ゲーム', '旅行', 'DIY', 'スポーツ観戦', '音楽', '写真撮影'])}。`,
    `最近の関心事は${randomItem(['健康管理', '資格取得', '投資', '推し活', '環境問題', 'AI技術', '子育て', '老後の生活', '転職', '趣味の深掘り'])}。`,
  ].join('');

  const systemPrompt = buildSystemPrompt({
    name,
    age,
    gender,
    occupation: occupation.title,
    occupationContext: occupation.context,
    personality: personality.trait,
    personalityDetail: personality.detail,
    speakingStyle: speakingStyle.style,
    speakingExample: speakingStyle.example,
    background: backgrounds,
  });

  return {
    id: uuidv4(),
    name,
    age,
    gender,
    occupation: occupation.title,
    personality: personality.trait,
    background: backgrounds,
    speaking_style: speakingStyle.style,
    system_prompt: systemPrompt,
    created_at: new Date().toISOString(),
  };
}

interface SystemPromptParams {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  occupationContext: string;
  personality: string;
  personalityDetail: string;
  speakingStyle: string;
  speakingExample: string;
  background: string;
}

function buildSystemPrompt(params: SystemPromptParams): string {
  return `あなたは以下の設定を持つ一般人のキャラクターとして会話してください。AIであることを明かさず、この人物として自然に振る舞ってください。

【基本情報】
- 名前: ${params.name}
- 年齢: ${params.age}歳
- 性別: ${params.gender}
- 職業: ${params.occupation}（${params.occupationContext}）

【性格】
${params.personality}
${params.personalityDetail}

【話し方】
${params.speakingStyle}（${params.speakingExample}）

【背景】
${params.background}

【会話のルール】
- 上記の人物設定に忠実に、自然な日本語で会話してください。
- 自分がAIであることに言及しないでください。
- 話し方の特徴を一貫して維持してください。
- 質問されたら、この人物の視点や経験に基づいて答えてください。
- 適度に自分の話もしつつ、相手の話にも興味を示してください。
- 長すぎる返答は避け、自然な会話の長さを心がけてください。`;
}

export function generateMultiplePersonas(count: number): Persona[] {
  const personas: Persona[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let persona: Persona;
    let attempts = 0;
    do {
      persona = generatePersona();
      attempts++;
    } while (usedNames.has(persona.name) && attempts < 50);

    usedNames.add(persona.name);
    personas.push(persona);
  }

  return personas;
}

export function savePersona(persona: Persona): void {
  const db = getDb();
  db.prepare(`
    INSERT OR REPLACE INTO personas (id, name, age, gender, occupation, personality, background, speaking_style, system_prompt, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    persona.id, persona.name, persona.age, persona.gender,
    persona.occupation, persona.personality, persona.background,
    persona.speaking_style, persona.system_prompt, persona.created_at
  );
}

export function getAllPersonas(): Persona[] {
  const db = getDb();
  return db.prepare('SELECT * FROM personas ORDER BY created_at DESC').all() as Persona[];
}

export function getPersonaById(id: string): Persona | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM personas WHERE id = ?').get(id) as Persona | undefined;
}

export function deletePersona(id: string): void {
  const db = getDb();
  db.prepare('DELETE FROM personas WHERE id = ?').run(id);
}

export function getRandomPersona(): Persona | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM personas ORDER BY RANDOM() LIMIT 1').get() as Persona | undefined;
}

export function initDefaultPersonas(): void {
  const db = getDb();
  const count = (db.prepare('SELECT COUNT(*) as count FROM personas').get() as { count: number }).count;
  if (count === 0) {
    const personas = generateMultiplePersonas(10);
    for (const persona of personas) {
      savePersona(persona);
    }
    console.log(`Generated ${personas.length} default personas`);
  }
}
