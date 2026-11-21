/* ============================================================
   தமிழ் நண்பன் அகாடமி — British Spoken English Course
   Udemy-style curriculum: modules → lessons.
   Lesson types: phrases | dialogue | grammar | video | speaking | quiz
   Edit this file to add / change content. No code change needed.
   ============================================================ */
window.COURSE = {
  title: 'British Spoken English — தமிழ் வழி',
  subtitle: 'அடிப்படையிலிருந்து தன்னம்பிக்கையுடன் பேசும் வரை · 10 modules',
  instructor: 'தமிழ் நண்பன் அகாடமி',
  level: 'Beginner → Intermediate',
  learn: [
    'தினசரி வாழ்க்கைச் சூழல்களில் (கடை, பயணம், அலுவலகம், மருத்துவர்) தன்னம்பிக்கையுடன் ஆங்கிலம் பேசுதல்',
    'British உச்சரிப்பில் 300+ பயன்படும் வாக்கியங்கள் (phrases)',
    'Present / Past / Future tenses — தமிழ் விளக்கத்துடன், எளிய விதிகள்',
    'நேர்காணல் (interview) & சுய அறிமுகம் (self-introduction) பயிற்சி',
    'மைக்கில் பேசி உச்சரிப்பை சரிபார்த்தல் (pronunciation score)',
    'ஒவ்வொரு module-க்கும் quiz · Flashcard மீள்பார்வை · சான்றிதழ்'
  ],
  modules: [

    /* ================= MODULE 1 ================= */
    { id: 'm1', icon: '👋', title: 'Greetings & Introductions', tamil: 'வணக்கம் & அறிமுகம்',
      desc: 'ஒருவரைச் சந்திக்கும்போது, தன்னை அறிமுகப்படுத்தும்போது பேச வேண்டிய அடிப்படை வாக்கியங்கள்.',
      lessons: [
        { id: 'm1l1', type: 'phrases', title: 'Greetings', tamil: 'வணக்கம் சொல்லுதல்', mins: 8, items: [
          { en: 'Good morning!', ta: 'காலை வணக்கம்!', tip: 'காலை 12 மணி வரை' },
          { en: 'Good afternoon!', ta: 'மதிய வணக்கம்!', tip: '12 முதல் மாலை 5–6 வரை' },
          { en: 'Good evening!', ta: 'மாலை வணக்கம்!', tip: 'மாலை 6-க்குப் பிறகு சந்திக்கும்போது' },
          { en: 'Hello! How are you?', ta: 'வணக்கம்! எப்படி இருக்கிறீர்கள்?' },
          { en: "I'm fine, thank you. And you?", ta: 'நான் நலம், நன்றி. நீங்கள்?' },
          { en: "I'm very well, thanks.", ta: 'நான் மிகவும் நலமாக இருக்கிறேன், நன்றி.' },
          { en: 'Nice to meet you.', ta: 'உங்களைச் சந்தித்ததில் மகிழ்ச்சி.', tip: 'முதல் முறை சந்திக்கும்போது' },
          { en: 'Pleased to meet you too.', ta: 'எனக்கும் மகிழ்ச்சி.' },
          { en: 'See you later!', ta: 'பிறகு சந்திப்போம்!' },
          { en: 'Good night. Take care!', ta: 'இரவு வணக்கம். கவனமாக இருங்கள்!', tip: 'Good night = விடைபெறும்போது மட்டும்' },
          { en: 'Have a nice day!', ta: 'நல்ல நாளாக அமையட்டும்!' },
          { en: 'Long time no see!', ta: 'ரொம்ப நாளாச்சு பார்த்து!' }
        ] },
        { id: 'm1l2', type: 'phrases', title: 'Introducing yourself', tamil: 'தன்னை அறிமுகப்படுத்துதல்', mins: 8, items: [
          { en: 'My name is Kumar.', ta: 'என் பெயர் குமார்.' },
          { en: "I'm from Chennai.", ta: 'நான் சென்னையைச் சேர்ந்தவன்.' },
          { en: 'I live in Madurai.', ta: 'நான் மதுரையில் வசிக்கிறேன்.' },
          { en: 'I work as a teacher.', ta: 'நான் ஆசிரியராகப் பணிபுரிகிறேன்.' },
          { en: "I'm a student at Anna University.", ta: 'நான் அண்ணா பல்கலைக்கழக மாணவன்.' },
          { en: 'This is my friend, Priya.', ta: 'இவர் என் தோழி, பிரியா.' },
          { en: 'What do you do?', ta: 'நீங்கள் என்ன வேலை செய்கிறீர்கள்?' },
          { en: 'Where are you from?', ta: 'நீங்கள் எந்த ஊர்?' },
          { en: 'How old are you?', ta: 'உங்கள் வயது என்ன?', tip: 'அறிமுகமில்லாதவரிடம் கேட்க வேண்டாம்' },
          { en: "I'm twenty-five years old.", ta: 'எனக்கு இருபத்தைந்து வயது.' },
          { en: 'I speak Tamil and a little English.', ta: 'நான் தமிழும், கொஞ்சம் ஆங்கிலமும் பேசுவேன்.' },
          { en: "It's nice talking to you.", ta: 'உங்களுடன் பேசியது மகிழ்ச்சி.' }
        ] },
        { id: 'm1l3', type: 'grammar', title: 'am / is / are (verb "to be")', tamil: 'am / is / are விதி', mins: 8,
          explain: 'ஆங்கிலத்தில் "இருக்கிறேன் / இருக்கிறார் / இருக்கிறார்கள்" என்பதை am / is / are கொண்டு சொல்கிறோம்.\n\n• I → am\n• He / She / It / ஒருவர் பெயர் → is\n• You / We / They / பலர் → are\n\nகேள்வி கேட்க: verb-ஐ முன்னால் கொண்டு வரவும் (Are you…? / Is he…?).\nஎதிர்மறை: not சேர்க்கவும் (I am not / He is not = isn\'t / They are not = aren\'t).',
          pattern: 'I am · He/She/It is · You/We/They are',
          examples: [
            { en: 'I am a teacher.', ta: 'நான் ஒரு ஆசிரியர்.' },
            { en: 'She is my sister.', ta: 'அவள் என் சகோதரி.' },
            { en: 'They are from Trichy.', ta: 'அவர்கள் திருச்சியைச் சேர்ந்தவர்கள்.' },
            { en: 'Are you a student?', ta: 'நீங்கள் மாணவரா?' },
            { en: 'He is not at home.', ta: 'அவர் வீட்டில் இல்லை.' },
            { en: "We aren't busy today.", ta: 'இன்று நாங்கள் வேலையாக இல்லை.' }
          ],
          mistakes: [
            { wrong: 'I is a doctor.', right: 'I am a doctor.', why: 'I-க்கு எப்போதும் am.' },
            { wrong: 'They is happy.', right: 'They are happy.', why: 'பலர் (they) → are.' },
            { wrong: 'You is my friend.', right: 'You are my friend.', why: 'You ஒருவராக இருந்தாலும் are.' }
          ] },
        { id: 'm1l4', type: 'dialogue', title: 'Meeting a new colleague', tamil: 'புதிய சக ஊழியரைச் சந்தித்தல்', mins: 6,
          scene: 'அலுவலகத்தில் முதல் நாள். ரவி புதிய சக ஊழியர் ஆன்னாவைச் சந்திக்கிறார்.',
          lines: [
            { w: 'A', en: 'Good morning! I\'m Ravi. I\'m new here.', ta: 'காலை வணக்கம்! நான் ரவி. நான் இங்கு புதியவன்.' },
            { w: 'B', en: 'Good morning, Ravi. I\'m Anna. Welcome to the team!', ta: 'காலை வணக்கம், ரவி. நான் ஆன்னா. குழுவிற்கு வரவேற்கிறேன்!' },
            { w: 'A', en: 'Thank you. Nice to meet you.', ta: 'நன்றி. உங்களைச் சந்தித்ததில் மகிழ்ச்சி.' },
            { w: 'B', en: 'Nice to meet you too. Where are you from?', ta: 'எனக்கும் மகிழ்ச்சி. நீங்கள் எந்த ஊர்?' },
            { w: 'A', en: 'I\'m from Coimbatore. And you?', ta: 'நான் கோயம்புத்தூர். நீங்கள்?' },
            { w: 'B', en: 'I\'m from Salem. What do you do here?', ta: 'நான் சேலம். இங்கே என்ன வேலை?' },
            { w: 'A', en: 'I\'m a software engineer. I work on the mobile app.', ta: 'நான் ஒரு மென்பொருள் பொறியாளர். மொபைல் அப்பில் வேலை செய்கிறேன்.' },
            { w: 'B', en: 'Great! If you need any help, just ask me.', ta: 'அருமை! ஏதாவது உதவி வேண்டுமானால், என்னிடம் கேளுங்கள்.' },
            { w: 'A', en: 'That\'s very kind of you. Thanks a lot!', ta: 'ரொம்ப நல்லது. மிக்க நன்றி!' }
          ] },
        { id: 'm1l5', type: 'video', title: 'Video: British greetings in real life', tamil: 'வீடியோ: நிஜ வாழ்க்கையில் வணக்கம்', mins: 10, yt: '',
          desc: 'இந்த வீடியோவில் British மக்கள் எப்படி வணக்கம் சொல்கிறார்கள், கைகுலுக்குகிறார்கள், "How are you?"-க்கு எப்படி பதில் சொல்கிறார்கள் என்பதைப் பாருங்கள்.',
          notes: ['"How are you?" என்பது ஒரு greeting — உண்மையான உடல்நிலை கேள்வி அல்ல. "Fine, thanks!" போதும்.', 'UK-ல் "Cheers!" = Thanks / Bye என்றும் பயன்படும்.', '"Alright?" என்று கேட்டால் அதுவும் Hello தான்!'] },
        { id: 'm1l6', type: 'speaking', title: 'Speaking: Introduce yourself', tamil: 'பேசு: உங்களை அறிமுகப்படுத்துங்கள்', mins: 5, tasks: [
          { ta: '"வணக்கம், என் பெயர் ___" என்று ஆங்கிலத்தில் சொல்லுங்கள். (உங்கள் பெயரைப் போடுங்கள்)', en: 'Hello, my name is' , loose: true },
          { ta: '"நான் சென்னையைச் சேர்ந்தவன்" — சொல்லுங்கள்.', en: 'I am from Chennai' },
          { ta: '"உங்களைச் சந்தித்ததில் மகிழ்ச்சி" — சொல்லுங்கள்.', en: 'Nice to meet you' },
          { ta: '"நீங்கள் என்ன வேலை செய்கிறீர்கள்?" — கேளுங்கள்.', en: 'What do you do' }
        ] },
        { id: 'm1l2b', type: 'phrases', title: 'Polite words & small talk', tamil: 'மரியாதைச் சொற்கள் & சிறு பேச்சு', mins: 8, items: [
          { en: 'Please.', ta: 'தயவுசெய்து.', tip: 'கேட்கும் எல்லா வாக்கியத்திலும் சேர்க்கவும்' },
          { en: 'Thank you so much!', ta: 'மிக்க நன்றி!' },
          { en: "You're welcome.", ta: 'பரவாயில்லை (நன்றிக்கு பதில்).' },
          { en: "I'm sorry.", ta: 'மன்னிக்கவும்.' },
          { en: 'Excuse me.', ta: 'மன்னிக்கவும் (கவனம் ஈர்க்க / வழி கேட்க).' },
          { en: 'No problem.', ta: 'பிரச்சினை இல்லை.' },
          { en: 'Of course!', ta: 'கண்டிப்பாக!' },
          { en: 'Really? That\'s great!', ta: 'அப்படியா? அருமை!' },
          { en: 'I see.', ta: 'புரிகிறது.' },
          { en: 'Never mind.', ta: 'விடுங்கள், பரவாயில்லை.' },
          { en: 'Congratulations!', ta: 'வாழ்த்துகள்!' },
          { en: 'How was your day?', ta: 'உங்கள் நாள் எப்படி இருந்தது?' },
          { en: 'It was lovely, thanks.', ta: 'மிக நன்றாக இருந்தது, நன்றி.' },
          { en: 'What a nice weather today!', ta: 'இன்று என்ன அழகான வானிலை!', tip: 'UK-ல் வானிலை பற்றிப் பேசுவது பொதுவான small talk' }
        ] },
        { id: 'm1l4b', type: 'dialogue', title: 'At a family function', tamil: 'குடும்ப விழாவில்', mins: 6,
          scene: 'ஒரு திருமண விழாவில் செல்வி தன் உறவினரின் நண்பரைச் சந்திக்கிறார்.',
          lines: [
            { w: 'A', en: 'Hello! I don\'t think we\'ve met. I\'m Selvi.', ta: 'வணக்கம்! நாம் சந்தித்ததில்லை என நினைக்கிறேன். நான் செல்வி.' },
            { w: 'B', en: 'Hi Selvi, I\'m David. I\'m a friend of Arun\'s.', ta: 'வணக்கம் செல்வி, நான் டேவிட். அருணின் நண்பன்.' },
            { w: 'A', en: 'Oh, lovely! How do you know Arun?', ta: 'ஓ, நல்லது! அருணை எப்படித் தெரியும்?' },
            { w: 'B', en: 'We studied together in college. And you?', ta: 'நாங்கள் கல்லூரியில் ஒன்றாகப் படித்தோம். நீங்கள்?' },
            { w: 'A', en: 'I\'m his cousin. Are you enjoying the function?', ta: 'நான் அவரது உறவினர். விழா பிடித்திருக்கிறதா?' },
            { w: 'B', en: 'Yes, very much. The food is delicious!', ta: 'ஆமாம், ரொம்ப. உணவு அருமையாக இருக்கிறது!' },
            { w: 'A', en: 'I\'m glad. Please help yourself to some sweets.', ta: 'மகிழ்ச்சி. தயவுசெய்து இனிப்பு எடுத்துக்கொள்ளுங்கள்.' },
            { w: 'B', en: 'Thank you so much. It was nice meeting you.', ta: 'மிக்க நன்றி. உங்களைச் சந்தித்தது மகிழ்ச்சி.' }
          ] },
        { id: 'm1l7', type: 'quiz', title: 'Module 1 Quiz', tamil: 'Module 1 தேர்வு', mins: 5, qs: [
          { q: '"Thank you" என்றதற்கு சரியான பதில்?', opts: ['You\'re welcome.', 'Please.', 'I\'m sorry.'], a: 0, why: 'நன்றிக்கு "You\'re welcome" / "No problem".' },
          { q: 'ஒருவரின் கவனத்தை ஈர்க்க / வழி கேட்க என்ன சொல்வீர்கள்?', opts: ['Never mind.', 'Excuse me.', 'Of course.'], a: 1, why: '"Excuse me" = மன்னிக்கவும் (கவனம் ஈர்க்க).' },
          { q: '"How do you know Arun?" என்றால்?', opts: ['அருண் யார்?', 'அருணை எப்படித் தெரியும்?', 'அருண் எங்கே?'], a: 1, why: 'அறிமுகத்தின் தொடர்பு கேட்கும் கேள்வி.' },
          { q: '"She ___ my sister."', opts: ['am', 'is', 'are'], a: 1, why: 'She → is.' },
          { q: 'மாலை 7 மணிக்கு ஒருவரைச் சந்திக்கும்போது என்ன சொல்வீர்கள்?', opts: ['Good night!', 'Good evening!', 'Good morning!'], a: 1, why: 'மாலை சந்திக்கும்போது Good evening. Good night விடைபெறும்போது மட்டும்.' },
          { q: '"Nice to meet you" என்பதற்கு சரியான பதில்?', opts: ['I am fine.', 'Nice to meet you too.', 'Good bye.'], a: 1, why: '"…you too" என்று திருப்பிச் சொல்வது மரபு.' },
          { q: 'சரியான வாக்கியம் எது?', opts: ['I is a student.', 'I are a student.', 'I am a student.'], a: 2, why: 'I → am.' },
          { q: '"They ___ from Madurai."', opts: ['is', 'are', 'am'], a: 1, why: 'They → are.' },
          { q: '"நீங்கள் எந்த ஊர்?" — ஆங்கிலத்தில்?', opts: ['Where are you from?', 'Where do you from?', 'From where you?'], a: 0, why: '"Where are you from?" தான் சரியான அமைப்பு.' },
          { q: '"What do you do?" என்றால்?', opts: ['நீங்கள் என்ன செய்து கொண்டிருக்கிறீர்கள்?', 'நீங்கள் என்ன வேலை செய்கிறீர்கள்?', 'நீங்கள் என்ன விரும்புகிறீர்கள்?'], a: 1, why: 'இது தொழில் / வேலை பற்றிய கேள்வி.' }
        ] }
      ] },

    /* ================= MODULE 2 ================= */
    { id: 'm2', icon: '⏰', title: 'Daily Routine', tamil: 'தினசரி வாழ்க்கை',
      desc: 'காலை எழுந்ததிலிருந்து இரவு தூங்கும் வரை — உங்கள் நாளைப் பற்றி ஆங்கிலத்தில் பேசுங்கள்.',
      lessons: [
        { id: 'm2l1', type: 'phrases', title: 'My day', tamil: 'என் நாள்', mins: 8, items: [
          { en: 'I wake up at six o\'clock.', ta: 'நான் ஆறு மணிக்கு எழுந்திருக்கிறேன்.' },
          { en: 'I brush my teeth and have a shower.', ta: 'பல் துலக்கி குளிக்கிறேன்.' },
          { en: 'I have breakfast at seven.', ta: 'ஏழு மணிக்கு காலை உணவு சாப்பிடுகிறேன்.', tip: '"eat breakfast" ஐ விட "have breakfast" இயல்பு' },
          { en: 'I go to work by bus.', ta: 'பேருந்தில் வேலைக்குப் போகிறேன்.' },
          { en: 'I start work at nine.', ta: 'ஒன்பது மணிக்கு வேலை தொடங்குகிறேன்.' },
          { en: 'I have lunch at one o\'clock.', ta: 'ஒரு மணிக்கு மதிய உணவு.' },
          { en: 'I finish work at six.', ta: 'ஆறு மணிக்கு வேலை முடிகிறது.' },
          { en: 'I come home at seven.', ta: 'ஏழு மணிக்கு வீடு வருகிறேன்.' },
          { en: 'I watch TV with my family.', ta: 'குடும்பத்துடன் டிவி பார்க்கிறேன்.' },
          { en: 'I go to bed at ten.', ta: 'பத்து மணிக்கு தூங்கப் போகிறேன்.' },
          { en: 'I usually get up early.', ta: 'நான் வழக்கமாக சீக்கிரம் எழுந்திருப்பேன்.', tip: 'usually = வழக்கமாக' },
          { en: 'I sometimes skip breakfast.', ta: 'சில நேரங்களில் காலை உணவைத் தவிர்ப்பேன்.', tip: 'sometimes = சில சமயம்' },
          { en: 'I never drink coffee at night.', ta: 'இரவில் ஒருபோதும் காபி குடிக்க மாட்டேன்.', tip: 'never = ஒருபோதும் இல்லை' }
        ] },
        { id: 'm2l2', type: 'grammar', title: 'Present Simple', tamil: 'Present Simple (தினசரி / வழக்கம்)', mins: 9,
          explain: 'தினமும் / வழக்கமாக நடக்கும் செயல்களுக்கு Present Simple.\n\n• I / You / We / They → verb அப்படியே: I work, They play\n• He / She / It → verb + s / es: He works, She watches, It goes\n\nகேள்வி: Do / Does + subject + verb (s இல்லாமல்)\n  Do you work? · Does she work?\nஎதிர்மறை: don\'t / doesn\'t + verb (s இல்லாமல்)\n  I don\'t like tea. · He doesn\'t eat meat.\n\n⚠️ He/She-க்கு does/doesn\'t வந்தால் verb-ல் s போடக் கூடாது.',
          pattern: 'I/You/We/They + verb · He/She/It + verb-s · Do/Does …?',
          examples: [
            { en: 'I go to work by train.', ta: 'நான் ரயிலில் வேலைக்குப் போகிறேன்.' },
            { en: 'She teaches English.', ta: 'அவள் ஆங்கிலம் கற்பிக்கிறாள்.' },
            { en: 'My father reads the newspaper every morning.', ta: 'என் அப்பா தினமும் காலையில் செய்தித்தாள் படிப்பார்.' },
            { en: 'Do you like coffee?', ta: 'உங்களுக்கு காபி பிடிக்குமா?' },
            { en: 'Does he live in Chennai?', ta: 'அவர் சென்னையில் வசிக்கிறாரா?' },
            { en: 'We don\'t work on Sundays.', ta: 'நாங்கள் ஞாயிறு வேலை செய்வதில்லை.' }
          ],
          mistakes: [
            { wrong: 'She go to school.', right: 'She goes to school.', why: 'She → verb + s/es.' },
            { wrong: 'Does he works here?', right: 'Does he work here?', why: 'Does வந்தால் verb-ல் s இல்லை.' },
            { wrong: 'I am go to office daily.', right: 'I go to the office daily.', why: 'வழக்கமான செயலுக்கு am + verb இல்லை.' }
          ] },
        { id: 'm2l3', type: 'dialogue', title: 'Talking about your day', tamil: 'உங்கள் நாளைப் பற்றிப் பேசுதல்', mins: 6,
          scene: 'மீனா தன் நண்பர் அருணிடம் அவரது தினசரி வழக்கம் பற்றிக் கேட்கிறார்.',
          lines: [
            { w: 'A', en: 'What time do you usually wake up?', ta: 'நீங்கள் வழக்கமாக எத்தனை மணிக்கு எழுந்திருப்பீர்கள்?' },
            { w: 'B', en: 'I wake up at half past five. I go for a walk.', ta: 'ஐந்தரை மணிக்கு எழுந்திருப்பேன். நடைப்பயிற்சிக்குப் போவேன்.' },
            { w: 'A', en: 'That\'s early! What do you have for breakfast?', ta: 'சீக்கிரம்தான்! காலை உணவுக்கு என்ன சாப்பிடுவீர்கள்?' },
            { w: 'B', en: 'Usually idli and sambar. Sometimes just tea.', ta: 'வழக்கமாக இட்லி சாம்பார். சில நேரம் டீ மட்டும்.' },
            { w: 'A', en: 'How do you go to work?', ta: 'வேலைக்கு எப்படிப் போவீர்கள்?' },
            { w: 'B', en: 'I take the metro. It takes about forty minutes.', ta: 'மெட்ரோவில் போவேன். சுமார் நாற்பது நிமிடம் ஆகும்.' },
            { w: 'A', en: 'And what do you do in the evening?', ta: 'மாலையில் என்ன செய்வீர்கள்?' },
            { w: 'B', en: 'I play cricket with my friends, then I cook dinner.', ta: 'நண்பர்களுடன் கிரிக்கெட் விளையாடுவேன், பிறகு இரவு உணவு சமைப்பேன்.' }
          ] },
        { id: 'm2l4', type: 'speaking', title: 'Speaking: Describe your morning', tamil: 'பேசு: உங்கள் காலை', mins: 5, tasks: [
          { ta: '"நான் ஆறு மணிக்கு எழுந்திருக்கிறேன்" — சொல்லுங்கள்.', en: 'I wake up at six o\'clock' },
          { ta: '"நான் பேருந்தில் வேலைக்குப் போகிறேன்" — சொல்லுங்கள்.', en: 'I go to work by bus' },
          { ta: '"நான் வழக்கமாக சீக்கிரம் எழுந்திருப்பேன்" — சொல்லுங்கள்.', en: 'I usually get up early' },
          { ta: '"நீங்கள் எத்தனை மணிக்கு எழுந்திருப்பீர்கள்?" — கேளுங்கள்.', en: 'What time do you wake up' }
        ] },
        { id: 'm2l1b', type: 'phrases', title: 'Time, days & how often', tamil: 'நேரம், நாட்கள் & எத்தனை முறை', mins: 8, items: [
          { en: 'What time is it?', ta: 'மணி என்ன?' },
          { en: "It's nine o'clock.", ta: 'ஒன்பது மணி.' },
          { en: "It's quarter past nine.", ta: 'ஒன்பதே கால் (9:15).', tip: 'quarter past = 15 நிமிடம் கடந்து' },
          { en: "It's half past nine.", ta: 'ஒன்பதரை (9:30).' },
          { en: "It's quarter to ten.", ta: 'பத்துக்குக் கால் குறைவு (9:45).', tip: 'quarter to = 15 நிமிடம் குறைவு' },
          { en: 'On Monday, I have a meeting.', ta: 'திங்கள் அன்று எனக்கு ஒரு கூட்டம்.', tip: 'நாட்களுக்கு on' },
          { en: 'At the weekend, I relax.', ta: 'வார இறுதியில் ஓய்வு எடுப்பேன்.', tip: 'British: at the weekend' },
          { en: 'In the morning, I exercise.', ta: 'காலையில் உடற்பயிற்சி செய்வேன்.', tip: 'morning/evening-க்கு in' },
          { en: 'I go to the gym twice a week.', ta: 'வாரம் இரண்டு முறை ஜிம் போவேன்.' },
          { en: 'I call my mother every day.', ta: 'தினமும் அம்மாவுக்கு போன் செய்வேன்.' },
          { en: "I'm running late.", ta: 'நான் தாமதமாகிவிட்டேன்.' },
          { en: "I'm always on time.", ta: 'நான் எப்போதும் சரியான நேரத்தில் வருவேன்.' },
          { en: 'See you at six, then.', ta: 'அப்போ ஆறு மணிக்குச் சந்திப்போம்.' }
        ] },
        { id: 'm2l3b', type: 'dialogue', title: 'Making plans with a friend', tamil: 'நண்பருடன் திட்டமிடுதல்', mins: 6,
          scene: 'கார்த்திக் தன் நண்பர் ஜானை வார இறுதியில் சந்திக்க அழைக்கிறார்.',
          lines: [
            { w: 'A', en: 'Hi John! Are you free this weekend?', ta: 'ஹாய் ஜான்! இந்த வார இறுதியில் free-யா?' },
            { w: 'B', en: 'I\'m busy on Saturday, but Sunday is fine.', ta: 'சனி வேலை இருக்கு, ஆனா ஞாயிறு சரி.' },
            { w: 'A', en: 'Great. Shall we go to the beach in the evening?', ta: 'அருமை. மாலையில் கடற்கரைக்குப் போகலாமா?' },
            { w: 'B', en: 'Good idea. What time?', ta: 'நல்ல யோசனை. எத்தனை மணிக்கு?' },
            { w: 'A', en: 'Let\'s meet at half past five near the bus stop.', ta: 'ஐந்தரை மணிக்கு பேருந்து நிறுத்தத்தில் சந்திப்போம்.' },
            { w: 'B', en: 'Perfect. I\'ll bring some snacks.', ta: 'சரி. நான் கொஞ்சம் snacks கொண்டு வருகிறேன்.' },
            { w: 'A', en: 'Lovely! See you on Sunday, then.', ta: 'அருமை! அப்போ ஞாயிறு சந்திப்போம்.' },
            { w: 'B', en: 'See you! Don\'t be late!', ta: 'சந்திப்போம்! தாமதமாக வராதே!' }
          ] },
        { id: 'm2l5', type: 'quiz', title: 'Module 2 Quiz', tamil: 'Module 2 தேர்வு', mins: 5, qs: [
          { q: '"quarter past nine" என்றால்?', opts: ['9:15', '9:45', '8:45'], a: 0, why: 'quarter past = 15 நிமிடம் கடந்து.' },
          { q: '"___ Monday I have a class."', opts: ['In', 'At', 'On'], a: 2, why: 'நாட்களுக்கு on.' },
          { q: '"I go to the gym twice a week" என்றால்?', opts: ['வாரம் ஒரு முறை', 'வாரம் இரண்டு முறை', 'வாரம் மூன்று முறை'], a: 1, why: 'twice = இரண்டு முறை.' },
          { q: '"Are you free this weekend?" — சரியான பதில்?', opts: ['Yes, I am.', 'Yes, I free.', 'Yes, I do.'], a: 0, why: '"Are you…?" கேள்விக்கு "Yes, I am."' },
          { q: '"She ___ English at a school."', opts: ['teach', 'teaches', 'teaching'], a: 1, why: 'She → verb + es.' },
          { q: 'சரியான கேள்வி எது?', opts: ['Does he works here?', 'Do he work here?', 'Does he work here?'], a: 2, why: 'Does + he + work (s இல்லை).' },
          { q: '"I ___ drink coffee at night." (ஒருபோதும் இல்லை)', opts: ['never', 'always', 'usually'], a: 0, why: 'never = ஒருபோதும் இல்லை.' },
          { q: '"We don\'t work on Sundays" என்றால்?', opts: ['ஞாயிறு நாங்கள் வேலை செய்வோம்.', 'ஞாயிறு நாங்கள் வேலை செய்வதில்லை.', 'ஞாயிறு நாங்கள் வேலை செய்தோம்.'], a: 1, why: 'don\'t = செய்வதில்லை.' },
          { q: '"half past five" என்றால்?', opts: ['5:30', '4:30', '5:15'], a: 0, why: 'half past = அரை மணி கடந்து → 5:30.' },
          { q: '"காலை உணவு சாப்பிடுகிறேன்" — இயல்பான ஆங்கிலம்?', opts: ['I eat the breakfast.', 'I have breakfast.', 'I am breakfast.'], a: 1, why: '"have breakfast" இயல்பான வழக்கு.' }
        ] }
      ] },

    /* ================= MODULE 3 ================= */
    { id: 'm3', icon: '🛒', title: 'Shopping & Market', tamil: 'கடை & சந்தை',
      desc: 'விலை கேட்பது, பேரம் பேசுவது, பணம் கொடுப்பது — கடையில் தேவையான அனைத்தும்.',
      lessons: [
        { id: 'm3l1', type: 'phrases', title: 'At the shop', tamil: 'கடையில்', mins: 8, items: [
          { en: 'Excuse me, how much is this?', ta: 'மன்னிக்கவும், இது என்ன விலை?' },
          { en: 'How much are these bananas?', ta: 'இந்த வாழைப்பழங்கள் என்ன விலை?' },
          { en: 'Do you have this in a bigger size?', ta: 'இது பெரிய size-ல் இருக்கிறதா?' },
          { en: 'Can I have a kilo of tomatoes, please?', ta: 'ஒரு கிலோ தக்காளி தாருங்கள்.' },
          { en: 'That\'s too expensive.', ta: 'அது ரொம்ப விலை அதிகம்.' },
          { en: 'Can you give me a discount?', ta: 'கொஞ்சம் தள்ளுபடி தர முடியுமா?' },
          { en: 'I\'ll take it.', ta: 'நான் இதை எடுத்துக்கொள்கிறேன்.', tip: 'வாங்க முடிவு செய்தபின்' },
          { en: 'I\'m just looking, thanks.', ta: 'நான் சும்மா பார்க்கிறேன், நன்றி.', tip: 'விற்பனையாளர் கேட்டால்' },
          { en: 'Do you accept cards?', ta: 'கார்டு ஏற்பீர்களா?' },
          { en: 'Can I pay by UPI?', ta: 'UPI-ல் பணம் கொடுக்கலாமா?' },
          { en: 'Here you are.', ta: 'இந்தாங்க.', tip: 'பணம் / பொருள் கொடுக்கும்போது' },
          { en: 'Keep the change.', ta: 'மீதி வைத்துக்கொள்ளுங்கள்.' },
          { en: 'Could I have a bag, please?', ta: 'ஒரு பை தர முடியுமா?' },
          { en: 'Can I get a receipt?', ta: 'ரசீது கிடைக்குமா?' }
        ] },
        { id: 'm3l2', type: 'grammar', title: 'How much / How many · some / any', tamil: 'எவ்வளவு / எத்தனை', mins: 8,
          explain: 'எண்ணக்கூடிய பொருள் (countable): apple, book, bag → How many? · many · a few\nஎண்ண முடியாதவை (uncountable): water, rice, money, sugar → How much? · much · a little\n\n⭐ விலை கேட்க எப்போதும் How much (எண்ணக்கூடிய பொருளாக இருந்தாலும்): How much is this bag?\n\nsome → நேர்மறை வாக்கியம் / கேட்கும்போது: I need some rice. · Can I have some water?\nany → எதிர்மறை / கேள்வி: I don\'t have any money. · Do you have any bags?',
          pattern: 'How many + countable · How much + uncountable / price',
          examples: [
            { en: 'How many apples do you want?', ta: 'எத்தனை ஆப்பிள் வேண்டும்?' },
            { en: 'How much rice do you need?', ta: 'எவ்வளவு அரிசி வேண்டும்?' },
            { en: 'How much is this shirt?', ta: 'இந்த சட்டை என்ன விலை?' },
            { en: 'I\'d like some sugar, please.', ta: 'கொஞ்சம் சர்க்கரை வேண்டும்.' },
            { en: 'Do you have any mangoes?', ta: 'மாம்பழம் இருக்கிறதா?' },
            { en: 'There isn\'t any milk left.', ta: 'பால் மீதம் இல்லை.' }
          ],
          mistakes: [
            { wrong: 'How many money do you have?', right: 'How much money do you have?', why: 'money எண்ண முடியாதது → much.' },
            { wrong: 'How much apples?', right: 'How many apples?', why: 'apples எண்ணக்கூடியது → many.' },
            { wrong: 'I don\'t have some money.', right: 'I don\'t have any money.', why: 'எதிர்மறையில் any.' }
          ] },
        { id: 'm3l3', type: 'dialogue', title: 'At the vegetable market', tamil: 'காய்கறி சந்தையில்', mins: 6,
          scene: 'லட்சுமி காய்கறி கடையில் பொருள் வாங்குகிறார்.',
          lines: [
            { w: 'A', en: 'Good morning! How much are the tomatoes?', ta: 'காலை வணக்கம்! தக்காளி என்ன விலை?' },
            { w: 'B', en: 'Forty rupees a kilo, madam.', ta: 'கிலோ நாற்பது ரூபாய், மேடம்.' },
            { w: 'A', en: 'That\'s a bit expensive. Can you make it thirty-five?', ta: 'கொஞ்சம் அதிகம். முப்பத்தைந்துக்குத் தர முடியுமா?' },
            { w: 'B', en: 'All right, thirty-five for you. How many kilos?', ta: 'சரி, உங்களுக்கு முப்பத்தைந்து. எத்தனை கிலோ?' },
            { w: 'A', en: 'Two kilos, please. And do you have any coriander?', ta: 'இரண்டு கிலோ. கொத்தமல்லி இருக்கிறதா?' },
            { w: 'B', en: 'Yes, ten rupees a bunch. Anything else?', ta: 'ஆமாம், கட்டு பத்து ரூபாய். வேறு ஏதாவது?' },
            { w: 'A', en: 'No, that\'s all. Can I pay by UPI?', ta: 'இல்லை, அவ்வளவுதான். UPI-ல் கொடுக்கலாமா?' },
            { w: 'B', en: 'Of course. The total is eighty rupees.', ta: 'கண்டிப்பாக. மொத்தம் எண்பது ரூபாய்.' },
            { w: 'A', en: 'Here you are. Thank you!', ta: 'இந்தாங்க. நன்றி!' }
          ] },
        { id: 'm3l4', type: 'speaking', title: 'Speaking: Buy something', tamil: 'பேசு: ஒரு பொருள் வாங்குங்கள்', mins: 5, tasks: [
          { ta: '"மன்னிக்கவும், இது என்ன விலை?" — கேளுங்கள்.', en: 'Excuse me, how much is this' },
          { ta: '"கொஞ்சம் தள்ளுபடி தர முடியுமா?" — கேளுங்கள்.', en: 'Can you give me a discount' },
          { ta: '"ஒரு கிலோ தக்காளி தாருங்கள்" — சொல்லுங்கள்.', en: 'Can I have a kilo of tomatoes please' },
          { ta: '"கார்டு ஏற்பீர்களா?" — கேளுங்கள்.', en: 'Do you accept cards' }
        ] },
        { id: 'm3l1b', type: 'phrases', title: 'At the clothes shop', tamil: 'துணிக்கடையில்', mins: 8, items: [
          { en: 'Can I try this on?', ta: 'இதை போட்டுப் பார்க்கலாமா?' },
          { en: 'Where is the fitting room?', ta: 'Trial room எங்கே?' },
          { en: "It's too small. Do you have a larger size?", ta: 'இது ரொம்ப சிறியது. பெரிய size இருக்கா?' },
          { en: "It's a bit loose.", ta: 'கொஞ்சம் தளர்வாக இருக்கிறது.' },
          { en: 'Do you have this in blue?', ta: 'இது நீல நிறத்தில் இருக்கா?' },
          { en: 'What size are you?', ta: 'உங்கள் size என்ன?' },
          { en: 'Medium, please.', ta: 'Medium.' },
          { en: 'It fits perfectly.', ta: 'சரியாகப் பொருந்துகிறது.' },
          { en: "I'll think about it.", ta: 'யோசித்துச் சொல்கிறேன்.', tip: 'வாங்க விரும்பாதபோது மரியாதையாக' },
          { en: 'Is there a sale on?', ta: 'தள்ளுபடி விற்பனை இருக்கா?' },
          { en: 'Can I return this if it doesn\'t fit?', ta: 'பொருந்தாவிட்டால் திருப்பித் தரலாமா?' },
          { en: 'Could I have the receipt, please?', ta: 'ரசீது தர முடியுமா?' }
        ] },
        { id: 'm3l3b', type: 'dialogue', title: 'Buying a shirt', tamil: 'சட்டை வாங்குதல்', mins: 6,
          scene: 'ரமேஷ் ஒரு துணிக்கடையில் சட்டை வாங்குகிறார்.',
          lines: [
            { w: 'A', en: 'Excuse me, do you have this shirt in a large?', ta: 'மன்னிக்கவும், இந்த சட்டை large size-ல் இருக்கா?' },
            { w: 'B', en: 'Let me check… Yes, here you are. Would you like to try it on?', ta: 'பார்க்கிறேன்… ஆமாம், இந்தாங்க. போட்டுப் பார்க்கிறீர்களா?' },
            { w: 'A', en: 'Yes, please. Where\'s the fitting room?', ta: 'ஆமாம். Trial room எங்கே?' },
            { w: 'B', en: 'Just over there, on the left.', ta: 'அங்கே, இடது பக்கம்.' },
            { w: 'A', en: 'It fits well. How much is it?', ta: 'நன்றாகப் பொருந்துகிறது. என்ன விலை?' },
            { w: 'B', en: 'It\'s eight hundred rupees, but there\'s a ten percent discount today.', ta: 'எண்ணூறு ரூபாய், ஆனால் இன்று பத்து சதவீதம் தள்ளுபடி.' },
            { w: 'A', en: 'Great, I\'ll take it. Can I pay by card?', ta: 'அருமை, எடுத்துக்கொள்கிறேன். கார்டில் கொடுக்கலாமா?' },
            { w: 'B', en: 'Of course. Here\'s your receipt. Have a nice day!', ta: 'கண்டிப்பாக. இதோ ரசீது. நல்ல நாளாக அமையட்டும்!' }
          ] },
        { id: 'm3l5', type: 'quiz', title: 'Module 3 Quiz', tamil: 'Module 3 தேர்வு', mins: 5, qs: [
          { q: 'சட்டையைப் போட்டுப் பார்க்க என்ன கேட்பீர்கள்?', opts: ['Can I try this on?', 'Can I take this on?', 'Can I see this on?'], a: 0, why: '"try on" = போட்டுப் பார்.' },
          { q: 'வாங்க விரும்பாதபோது மரியாதையாகச் சொல்வது?', opts: ['I don\'t want.', 'I\'ll think about it.', 'Go away.'], a: 1, why: '"I\'ll think about it" மரியாதையான மறுப்பு.' },
          { q: '"It\'s a bit loose" என்றால்?', opts: ['கொஞ்சம் இறுக்கம்', 'கொஞ்சம் தளர்வு', 'கொஞ்சம் நீளம்'], a: 1, why: 'loose = தளர்வு; tight = இறுக்கம்.' },
          { q: '"Is there a sale on?" என்றால்?', opts: ['விற்பனையாளர் இருக்கிறாரா?', 'தள்ளுபடி விற்பனை இருக்கா?', 'கடை திறந்திருக்கா?'], a: 1, why: 'sale = தள்ளுபடி விற்பனை.' },
          { q: '"How ___ is this bag?" (விலை)', opts: ['many', 'much', 'more'], a: 1, why: 'விலைக்கு எப்போதும் How much.' },
          { q: '"How ___ bananas do you want?"', opts: ['much', 'many', 'more'], a: 1, why: 'bananas எண்ணக்கூடியது → many.' },
          { q: 'வாங்க முடிவு செய்தபின் என்ன சொல்வீர்கள்?', opts: ['I\'m just looking.', 'I\'ll take it.', 'Keep the change.'], a: 1, why: '"I\'ll take it" = இதை எடுத்துக்கொள்கிறேன்.' },
          { q: '"I don\'t have ___ money."', opts: ['some', 'any', 'many'], a: 1, why: 'எதிர்மறை வாக்கியத்தில் any.' },
          { q: '"Keep the change" என்றால்?', opts: ['மாற்றிக் கொடுங்கள்', 'மீதி வைத்துக்கொள்ளுங்கள்', 'மாற்றம் வேண்டாம்'], a: 1, why: 'change = மீதிப் பணம்.' },
          { q: '"Here you are" எப்போது சொல்வது?', opts: ['பொருள்/பணம் கொடுக்கும்போது', 'வணக்கம் சொல்லும்போது', 'விடைபெறும்போது'], a: 0, why: 'ஒன்றை நீட்டிக் கொடுக்கும்போது.' }
        ] }
      ] },

    /* ================= MODULE 4 ================= */
    { id: 'm4', icon: '🗺️', title: 'Directions & Travel', tamil: 'வழி & பயணம்',
      desc: 'வழி கேட்பது, வழி சொல்வது, பேருந்து / ரயில் டிக்கெட் வாங்குவது.',
      lessons: [
        { id: 'm4l1', type: 'phrases', title: 'Asking the way', tamil: 'வழி கேட்பது', mins: 8, items: [
          { en: 'Excuse me, where is the bus stop?', ta: 'மன்னிக்கவும், பேருந்து நிறுத்தம் எங்கே?' },
          { en: 'How do I get to the railway station?', ta: 'ரயில் நிலையத்துக்கு எப்படிப் போவது?' },
          { en: 'Is it far from here?', ta: 'இங்கிருந்து தூரமா?' },
          { en: 'How far is it?', ta: 'எவ்வளவு தூரம்?' },
          { en: 'Go straight on.', ta: 'நேராகப் போங்கள்.' },
          { en: 'Turn left at the traffic lights.', ta: 'சிக்னலில் இடதுபுறம் திரும்புங்கள்.' },
          { en: 'Turn right after the temple.', ta: 'கோவிலுக்குப் பிறகு வலதுபுறம் திரும்புங்கள்.' },
          { en: 'It\'s next to the bank.', ta: 'அது வங்கிக்குப் பக்கத்தில் இருக்கிறது.' },
          { en: 'It\'s opposite the hospital.', ta: 'அது மருத்துவமனைக்கு எதிரில்.' },
          { en: 'It\'s about ten minutes\' walk.', ta: 'சுமார் பத்து நிமிட நடை.' },
          { en: 'You can\'t miss it.', ta: 'தவறவிட மாட்டீர்கள் (எளிதாகத் தெரியும்).' },
          { en: 'Which bus goes to T. Nagar?', ta: 'டி. நகருக்கு எந்தப் பேருந்து போகும்?' },
          { en: 'One ticket to Madurai, please.', ta: 'மதுரைக்கு ஒரு டிக்கெட் தாருங்கள்.' },
          { en: 'What time does the train leave?', ta: 'ரயில் எத்தனை மணிக்குப் புறப்படும்?' },
          { en: 'Which platform is it?', ta: 'எந்த பிளாட்ஃபார்ம்?' }
        ] },
        { id: 'm4l1b', type: 'phrases', title: 'At the bus & railway station', tamil: 'பேருந்து & ரயில் நிலையத்தில்', mins: 8, items: [
          { en: 'Is this the bus to Trichy?', ta: 'இது திருச்சிக்குப் போகும் பேருந்தா?' },
          { en: 'Does this train stop at Tambaram?', ta: 'இந்த ரயில் தாம்பரத்தில் நிற்குமா?' },
          { en: 'How long does it take?', ta: 'எவ்வளவு நேரம் ஆகும்?' },
          { en: 'Is this seat taken?', ta: 'இந்த இருக்கையில் யாராவது இருக்கிறார்களா?' },
          { en: 'Could you tell me when we reach Egmore?', ta: 'எழும்பூர் வந்ததும் சொல்ல முடியுமா?' },
          { en: 'Where is platform three?', ta: 'மூன்றாவது பிளாட்ஃபார்ம் எங்கே?' },
          { en: 'Is the train on time?', ta: 'ரயில் சரியான நேரத்தில் வருகிறதா?' },
          { en: 'The train is delayed by twenty minutes.', ta: 'ரயில் இருபது நிமிடம் தாமதம்.' },
          { en: "I'd like a window seat, please.", ta: 'ஜன்னல் இருக்கை வேண்டும்.' },
          { en: 'A return ticket to Salem, please.', ta: 'சேலத்துக்கு போய் வர டிக்கெட்.', tip: 'return = போய் வர; single = ஒரு வழி' },
          { en: 'Where can I book a cab?', ta: 'கேப் எங்கே book செய்யலாம்?' },
          { en: 'Please drop me at the main gate.', ta: 'மெயின் கேட்டில் இறக்கி விடுங்கள்.' }
        ] },
        { id: 'm4l3', type: 'speaking', title: 'Speaking: On a journey', tamil: 'பேசு: பயணத்தில்', mins: 5, tasks: [
          { ta: '"மன்னிக்கவும், பேருந்து நிறுத்தம் எங்கே?" — கேளுங்கள்.', en: 'Excuse me, where is the bus stop' },
          { ta: '"இது திருச்சிக்குப் போகும் பேருந்தா?" — கேளுங்கள்.', en: 'Is this the bus to Trichy' },
          { ta: '"எவ்வளவு நேரம் ஆகும்?" — கேளுங்கள்.', en: 'How long does it take' },
          { ta: '"மதுரைக்கு ஒரு டிக்கெட் தாருங்கள்" — சொல்லுங்கள்.', en: 'One ticket to Madurai, please' }
        ] },
        { id: 'm4l4', type: 'quiz', title: 'Module 4 Quiz', tamil: 'Module 4 தேர்வு', mins: 5, qs: [
          { q: '"Is this seat taken?" என்றால்?', opts: ['இந்த இருக்கை உடைந்ததா?', 'இந்த இருக்கையில் யாராவது இருக்கிறார்களா?', 'இந்த இருக்கை எனதா?'], a: 1, why: 'taken = ஏற்கனவே யாரோ எடுத்துள்ளார்.' },
          { q: '"return ticket" என்றால்?', opts: ['ஒரு வழி டிக்கெட்', 'போய் வர டிக்கெட்', 'ரத்து டிக்கெட்'], a: 1, why: 'return = போய் வர; single = ஒரு வழி.' },
          { q: '"How ___ does it take?" (எவ்வளவு நேரம்)', opts: ['long', 'much', 'far'], a: 0, why: 'நேரம் → How long; தூரம் → How far.' },
          { q: '"ரயில் இருபது நிமிடம் தாமதம்" — ஆங்கிலத்தில்?', opts: ['The train is late twenty minutes.', 'The train is delayed by twenty minutes.', 'The train delay twenty minutes.'], a: 1, why: '"delayed by + நேரம்" சரியான அமைப்பு.' },
          { q: '"Turn left at the traffic lights" என்றால்?', opts: ['சிக்னலில் வலது', 'சிக்னலில் இடது', 'சிக்னலில் நேராக'], a: 1, why: 'left = இடது.' },
          { q: '"It\'s opposite the hospital" என்றால்?', opts: ['மருத்துவமனைக்கு எதிரில்', 'மருத்துவமனைக்குப் பக்கத்தில்', 'மருத்துவமனைக்குப் பின்னால்'], a: 0, why: 'opposite = எதிரில்.' }
        ] }
      ] }
  ]
};
