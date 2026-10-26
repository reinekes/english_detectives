// Original fiction. All people and events in this case are invented.
export const CASE = {
  id: 'the-last-letter',
  title: 'The Last Letter',
  subtitle: 'The Ashford Affair',
  date: 'London, 14 November 1891',
  location: 'Ashford House, Kensington',
  level: 'B1 · Intermediate',
  duration: '20–30 minutes',
  briefing: 'Sir Edmund Ashford is dead. At 8:15 last night, a footman found him beside his desk. A cup of tea and an unfinished letter were nearby. Four people had a reason to fear his next words. Inspector Lestrade has asked Holmes for help. Read the evidence, question the suspects, and discover who stopped the last letter.',
  briefingRu: 'Сэр Эдмунд Эшфорд мёртв. Вчера вечером в 8:15 лакей нашёл его рядом с письменным столом. Поблизости стояла чашка чая и лежало незаконченное письмо. Четверо людей могли бояться его следующих слов. Инспектор Лестрейд попросил Холмса о помощи. Изучите улики, допросите подозреваемых и узнайте, кто помешал закончить последнее письмо.',
  chapters: [
    { id: 'scene', title: 'Examine the scene', description: 'Visit three places and collect six pieces of evidence.', descriptionRu: 'Посетите три места и соберите шесть улик.' },
    { id: 'interviews', title: 'Hear their stories', description: 'Ask four suspects about the evening. Compare their answers with the evidence.', descriptionRu: 'Расспросите четверых подозреваемых о событиях вечера. Сравните ответы с уликами.' },
    { id: 'deductions', title: 'Connect the facts', description: 'Make three deductions, then name the person responsible.', descriptionRu: 'Сделайте три вывода, затем назовите виновного.' }
  ],
  culpritId: 'reed',
  explanation: 'Arthur Reed killed Ashford to hide the missing charity money. Watson’s report places the poisoning between 8:05 and 8:15. The cup was poisoned; the teapot was clean. Eleanor and Dr Mercer were at the hospital during this whole period, and two witnesses place Finch in the kitchen. Reed claimed to be at the station, but the messenger’s signed receipt places him inside the study at 8:10, with Ashford still alive. The footman saw no other visitor. The ledger links Reed to the missing £200, and the last letter shows that Ashford planned to tell the police at nine. Reed had the motive and was the only suspect with the opportunity.',
  explanationRu: 'Артур Рид убил Эшфорда, чтобы скрыть пропажу благотворительных денег. Заключение Ватсона относит отравление к промежутку между 8:05 и 8:15. Яд был в чашке, а чайник оказался чистым. Элеонора и доктор Мерсер всё это время находились в больнице, а двое свидетелей подтверждают, что Финч была на кухне. Рид утверждал, что находился на станции, однако подписанная расписка посыльного помещает его в кабинет в 8:10, когда Эшфорд ещё был жив. Лакей не видел других посетителей. Бухгалтерская книга связывает Рида с пропавшими 200 фунтами, а последнее письмо показывает, что в девять Эшфорд собирался обратиться в полицию. У Рида был мотив, и только у него из подозреваемых была возможность совершить преступление.',
  requiredClues: ['cup', 'telegram', 'ledger'],
  requiredDeductions: ['poisoned-cup', 'false-alibi', 'missing-money'],
  initialClues: []
};

export const PEOPLE = [
  {
    id: 'reed', name: 'Arthur Reed', role: 'The secretary', initials: 'AR', color: '#a67b52',
    description: 'Ashford’s quiet secretary. He keeps the accounts and knows every room in the house.',
    descriptionRu: 'Тихий секретарь Эшфорда. Он ведёт счета и знает каждую комнату в доме.',
    questions: [
      {
        id: 'reed-alibi', text: 'Where were you at 8:10?',
        answer: 'At the station. I left the house at 7:50 and stayed there until 8:20. I sent a telegram. The station clerk will remember me.',
        answerRu: 'На станции. Я вышел из дома в 7:50 и оставался там до 8:20. Я отправил телеграмму. Служащий станции меня вспомнит.',
        unlocks: ['telegram']
      },
      {
        id: 'reed-money', text: 'Did Sir Edmund check the accounts?',
        answer: 'He checked them yesterday. He said that two hundred pounds were missing. I keep the books, but that does not make me a thief.',
        answerRu: 'Он проверил их вчера. Он сказал, что не хватает двухсот фунтов. Я веду книги, но это ещё не делает меня вором.',
        unlocks: []
      },
      {
        id: 'reed-letter', text: 'What was the unfinished letter about?',
        answer: 'I do not know. Sir Edmund often wrote business letters at night. I did not enter his study that evening.',
        answerRu: 'Я не знаю. Сэр Эдмунд часто писал деловые письма по вечерам. В тот вечер я не заходил в его кабинет.',
        unlocks: []
      }
    ]
  },
  {
    id: 'eleanor', name: 'Eleanor Ashford', role: 'The niece', initials: 'EA', color: '#8a788c',
    description: 'Sir Edmund’s niece. They argued that afternoon about her plans to leave London.',
    descriptionRu: 'Племянница сэра Эдмунда. Днём они спорили из-за её планов уехать из Лондона.',
    questions: [
      {
        id: 'eleanor-argument', text: 'Why did you argue with your uncle?',
        answer: 'I want to study art in Paris. He thought it was a foolish plan. We argued, but I loved him. I did not want his money.',
        answerRu: 'Я хочу учиться живописи в Париже. Он считал это глупой затеей. Мы поссорились, но я его любила. Мне не нужны были его деньги.',
        unlocks: []
      },
      {
        id: 'eleanor-alibi', text: 'Where were you during the evening?',
        answer: 'At St Anne’s Hospital with Dr Mercer, from 7:45 until 8:25. I read to the children. The nurse signed us in and out; her record is with Inspector Lestrade.',
        answerRu: 'В больнице Святой Анны с доктором Мерсером, с 7:45 до 8:25. Я читала детям. Медсестра записала время нашего прихода и ухода; её журнал находится у инспектора Лестрейда.',
        unlocks: []
      },
      {
        id: 'eleanor-accounts', text: 'Was anything else troubling your uncle?',
        answer: 'The charity accounts. He carried a ledger all afternoon. Before I left, he said, “A promise is not enough. I need the money back.” He did not tell me whom he meant.',
        answerRu: 'Благотворительные счета. Он весь день носил с собой бухгалтерскую книгу. Перед моим уходом он сказал: «Обещания недостаточно. Мне нужно вернуть деньги». Он не объяснил, о ком говорил.',
        unlocks: ['ledger']
      }
    ]
  },
  {
    id: 'mercer', name: 'Dr Felix Mercer', role: 'The physician', initials: 'FM', color: '#73867f',
    description: 'The family doctor. Ashford recently stopped giving money to his hospital.',
    descriptionRu: 'Семейный врач. Недавно Эшфорд перестал жертвовать деньги его больнице.',
    questions: [
      {
        id: 'mercer-death', text: 'Was Sir Edmund ill?',
        answer: 'His heart was healthy. Dr Watson has examined the cup and the body. His report says this was poisoning, not a sudden illness. Read his report with the cup.',
        answerRu: 'Сердце у него было здоровым. Доктор Ватсон осмотрел тело и чашку. В его заключении сказано, что это отравление, а не внезапная болезнь. Прочитайте заключение вместе с описанием чашки.',
        unlocks: ['cup']
      },
      {
        id: 'mercer-alibi', text: 'Can anyone confirm your story?',
        answer: 'Eleanor was with me at St Anne’s Hospital from 7:45 until 8:25. The nurse’s record confirms it. Neither of us left the children’s room during that visit.',
        answerRu: 'Элеонора была со мной в больнице Святой Анны с 7:45 до 8:25. Это подтверждает журнал медсестры. Во время визита никто из нас не покидал детскую палату.',
        unlocks: []
      },
      {
        id: 'mercer-money', text: 'Were you angry about the hospital money?',
        answer: 'I was disappointed. But Sir Edmund stopped every payment while he checked the charity accounts. He promised to explain the problem tomorrow.',
        answerRu: 'Я был разочарован. Но сэр Эдмунд приостановил все выплаты, пока проверял благотворительные счета. Он обещал завтра объяснить, в чём проблема.',
        unlocks: []
      }
    ]
  },
  {
    id: 'finch', name: 'Clara Finch', role: 'The housekeeper', initials: 'CF', color: '#a18c6b',
    description: 'The housekeeper of twenty years. She prepared the evening tea and knows the family’s secrets.',
    descriptionRu: 'Экономка, прослужившая в доме двадцать лет. Она готовила вечерний чай и знает семейные тайны.',
    questions: [
      {
        id: 'finch-tea', text: 'Who took the tea into the study?',
        answer: 'I made the tea. James, the footman, took a fresh cup and the pot in at eight. He stayed until 8:05. After that, he watched the study door from the hall. Ask what he saw.',
        answerRu: 'Я приготовила чай. Джеймс, лакей, внёс чистую чашку и чайник в восемь. Он оставался в кабинете до 8:05. Затем он наблюдал за дверью кабинета из холла. Выясните, что он видел.',
        unlocks: []
      },
      {
        id: 'finch-alibi', text: 'Where were you after making the tea?',
        answer: 'In the kitchen from 7:55 until 8:20, with the cook and a visiting police constable. They both confirmed this to Lestrade. I heard James shout at 8:15, but the constable told me to stay there.',
        answerRu: 'На кухне с 7:55 до 8:20, вместе с поваром и зашедшим полицейским констеблем. Они оба подтвердили это Лестрейду. В 8:15 я услышала крик Джеймса, но констебль велел мне остаться на месте.',
        unlocks: []
      },
      {
        id: 'finch-thread', text: 'Did you notice anything unusual in the hall?',
        answer: 'A black thread lay beside the study door. Eleanor wore a black coat that day. But the hall curtain has a broken cord too. Look closely before you blame anyone.',
        answerRu: 'Рядом с дверью кабинета лежала чёрная нить. В тот день Элеонора была в чёрном пальто. Но у шторы в холле тоже порван шнур. Присмотритесь, прежде чем кого-либо обвинять.',
        unlocks: []
      }
    ]
  }
];

export const CLUES = [
  {
    id: 'letter', title: 'The unfinished letter', type: 'Document', location: 'The study', icon: 'letter',
    description: 'A letter lies under Ashford’s hand. Its first line is missing.',
    descriptionRu: 'Под рукой Эшфорда лежит письмо. Первая строка отсутствует.',
    detail: '“I have checked the charity accounts. Return the missing two hundred pounds before nine tonight, or I shall send the ledger to the police.” The top of the page, including the name, has been torn away. The pen still rests beside the final word. This is a warning about stolen money, not a change to his will.',
    detailRu: '«Я проверил благотворительные счета. Верните пропавшие двести фунтов до девяти часов сегодняшнего вечера, иначе я отправлю бухгалтерскую книгу в полицию». Верхняя часть листа, включая имя адресата, оторвана. Ручка по-прежнему лежит рядом с последним словом. Это предупреждение о похищенных деньгах, а не изменение завещания.',
    wordIds: ['torn', 'ledger', 'evidence', 'motive']
  },
  {
    id: 'cup', title: 'The porcelain cup', type: 'Physical evidence', location: 'The study', icon: 'cup',
    description: 'A cold cup of tea stands beside a clean teapot. Watson has left his report.',
    descriptionRu: 'Рядом с чистым чайником стоит остывшая чашка чая. Ватсон оставил своё заключение.',
    detail: 'Watson’s report: poison is present in Ashford’s cup. The teapot and sugar are clean. His examination places the poisoning between 8:05 and 8:15. James, the footman, stayed with Ashford until 8:05 and then watched the only study door. He saw one visitor enter at 8:10 and leave at 8:12. The window was locked from inside. The visitor’s identity appears in the telegram receipt.',
    detailRu: 'Заключение Ватсона: в чашке Эшфорда обнаружен яд. В чайнике и сахаре его нет. По результатам осмотра отравление произошло между 8:05 и 8:15. Джеймс, лакей, оставался с Эшфордом до 8:05, а затем наблюдал за единственной дверью кабинета. Он видел, как один посетитель вошёл в 8:10 и вышел в 8:12. Окно было заперто изнутри. Личность посетителя указана в расписке за телеграмму.',
    wordIds: ['poison', 'evidence', 'witness', 'receipt']
  },
  {
    id: 'watch', title: 'The broken pocket watch', type: 'Timeline', location: 'The entrance hall', icon: 'watch',
    description: 'Ashford’s watch stopped at 8:15. James has placed it on the hall table.',
    descriptionRu: 'Часы Эшфорда остановились в 8:15. Джеймс положил их на столик в холле.',
    detail: 'The glass broke when Ashford fell. James heard the crash at 8:15 and opened the study door at once. He found Ashford alone. Lestrade checked the watch against the hall clock. It confirms when the body was found; it does not show when the poison was added. Do not use the stopped watch as an exact time of the crime.',
    detailRu: 'Стекло разбилось, когда Эшфорд упал. В 8:15 Джеймс услышал грохот и сразу открыл дверь кабинета. Эшфорд был один. Лестрейд сверил часы с часами в холле. Они подтверждают время обнаружения тела, но не показывают, когда был добавлен яд. Не считайте остановившиеся часы точным указанием времени преступления.',
    wordIds: ['evidence', 'witness', 'confirm']
  },
  {
    id: 'ledger', title: 'The charity ledger', type: 'Financial record', location: 'The station office', icon: 'ledger',
    description: 'Lestrade brought the accounts to the station. One payment has a red mark.',
    descriptionRu: 'Лестрейд принёс счета в полицейский участок. Один платёж отмечен красным.',
    detail: 'The book records £200 taken from the children’s charity fund. A bank receipt names Arthur Reed as the person who received the money for his private debt. The charity approved no such payment. Ashford wrote beside it: “A. Reed must return this tonight.” No payment goes to Eleanor, Mercer, or Finch. A note from the bank confirms that the receipt is real.',
    detailRu: 'В книге записано изъятие 200 фунтов из детского благотворительного фонда. Банковская квитанция называет Артура Рида получателем денег для погашения личного долга. Благотворительное общество такой платёж не одобряло. Рядом Эшфорд написал: «А. Рид должен вернуть это сегодня вечером». Платежей Элеоноре, Мерсеру или Финч нет. Записка из банка подтверждает подлинность квитанции.',
    wordIds: ['ledger', 'receipt', 'debt', 'motive']
  },
  {
    id: 'telegram', title: 'The delivery receipt', type: 'Verified record', location: 'The station office', icon: 'telegram',
    description: 'Two official times reveal a serious problem with Reed’s story.',
    descriptionRu: 'Две официальные отметки времени обнаруживают серьёзную проблему в рассказе Рида.',
    detail: 'A messenger delivered a business telegram to Ashford House at 8:10. His receipt bears Arthur Reed’s signature. The messenger’s statement says: “Reed met me at the study door, took the telegram inside, and signed at the desk. I saw Sir Edmund alive in his chair.” James confirms that Reed was the only visitor from 8:05 to 8:15. The station clerk confirms Reed sent his own telegram at 8:25, after the death. Reed was not at the station throughout the period he claimed.',
    detailRu: 'Посыльный доставил деловую телеграмму в дом Эшфорда в 8:10. На его расписке стоит подпись Артура Рида. В показаниях посыльного сказано: «Рид встретил меня у двери кабинета, внёс телеграмму внутрь и расписался за письменным столом. Я видел сэра Эдмунда живым в кресле». Джеймс подтверждает, что Рид был единственным посетителем между 8:05 и 8:15. Служащий станции подтверждает, что Рид отправил собственную телеграмму в 8:25, уже после смерти Эшфорда. Рид не находился на станции всё то время, о котором говорил.',
    wordIds: ['alibi', 'signature', 'receipt', 'confirm', 'witness']
  },
  {
    id: 'thread', title: 'The black thread', type: 'Comparison', location: 'The entrance hall', icon: 'thread',
    description: 'A black thread near the study door seems to point towards Eleanor’s coat.',
    descriptionRu: 'Чёрная нить у двери кабинета на первый взгляд указывает на пальто Элеоноры.',
    detail: 'Under Holmes’s lens, the thread is a rough piece of cotton cord. It matches the broken cord on the hall curtain, including its small white centre. Eleanor’s coat is made of smooth black wool. The colour is similar, but the material is different. This thread does not connect Eleanor with the crime. The hospital record also confirms her alibi.',
    detailRu: 'Под лупой Холмса видно, что это грубый кусочек хлопкового шнура. Он совпадает с порванным шнуром шторы в холле, включая маленькую белую сердцевину. Пальто Элеоноры сшито из гладкой чёрной шерсти. Цвет похож, но материал другой. Эта нить не связывает Элеонору с преступлением. Больничный журнал также подтверждает её алиби.',
    wordIds: ['thread', 'rough', 'alibi', 'suspect']
  }
];

export const DEDUCTIONS = [
  {
    id: 'poisoned-cup', title: 'The poisoned tea',
    prompt: 'The teapot and sugar are clean. Where was the poison added?',
    options: [
      { id: 'pot', text: 'To the shared teapot in the kitchen.' },
      { id: 'cup', text: 'Directly to Ashford’s personal cup.' },
      { id: 'letter', text: 'To the paper of the unfinished letter.' }
    ],
    answerId: 'cup',
    explanation: 'The poison was found only in the cup. Watson’s report places the poisoning between 8:05 and 8:15, when Ashford was in the study.',
    explanationRu: 'Яд обнаружили только в чашке. По заключению Ватсона, отравление произошло между 8:05 и 8:15, когда Эшфорд находился в кабинете.',
    requires: ['cup']
  },
  {
    id: 'false-alibi', title: 'A false alibi',
    prompt: 'What does the signed delivery receipt prove?',
    options: [
      { id: 'reed-study', text: 'Reed was in the study at 8:10. His station alibi is false.' },
      { id: 'eleanor-house', text: 'Eleanor secretly returned from the hospital.' },
      { id: 'finch-station', text: 'Finch sent a telegram before preparing the tea.' }
    ],
    answerId: 'reed-study',
    explanation: 'The receipt and messenger place Reed at Ashford’s desk at 8:10. The station clerk saw him at 8:25. Sending a telegram later does not prove he was at the station earlier.',
    explanationRu: 'Расписка и показания посыльного подтверждают, что в 8:10 Рид находился у стола Эшфорда. Служащий станции видел его в 8:25. Отправленная позднее телеграмма не доказывает, что раньше он тоже был на станции.',
    requires: ['telegram']
  },
  {
    id: 'missing-money', title: 'The reason for the crime',
    prompt: 'Read the last letter and the charity ledger together. What was Ashford about to expose?',
    options: [
      { id: 'inheritance', text: 'Eleanor planned to take his whole estate.' },
      { id: 'hospital', text: 'Dr Mercer planned to close the hospital.' },
      { id: 'reed-theft', text: 'Reed took £200 from the charity to pay a private debt.' }
    ],
    answerId: 'reed-theft',
    explanation: 'The bank receipt names Reed, and Ashford’s note demands the money back. The unfinished letter threatens to send the ledger to the police at nine. This gives Reed a clear motive.',
    explanationRu: 'Банковская квитанция называет Рида, а записка Эшфорда требует вернуть деньги. В незаконченном письме он угрожает в девять отправить бухгалтерскую книгу в полицию. Это даёт Риду ясный мотив.',
    requires: ['letter', 'ledger']
  }
];

export const WORDS = [
  { id: 'alibi', word: 'alibi', phonetic: '/ˈælɪbaɪ/', translation: 'алиби', definition: 'Evidence that you were somewhere else when a crime happened.', example: 'The inspector asked each person to explain their alibi.' },
  { id: 'evidence', word: 'evidence', phonetic: '/ˈevɪdəns/', translation: 'улики; доказательства', definition: 'Facts or objects that help show what happened.', example: 'Look at all the evidence before you decide.' },
  { id: 'suspect', word: 'suspect', phonetic: '/ˈsʌspekt/', translation: 'подозреваемый', definition: 'A person who may have committed a crime.', example: 'Each suspect tells a different story.' },
  { id: 'witness', word: 'witness', phonetic: '/ˈwɪtnəs/', translation: 'свидетель', definition: 'A person who saw or heard an event.', example: 'The witness remembered the sound of a carriage.' },
  { id: 'ledger', word: 'ledger', phonetic: '/ˈledʒə/', translation: 'бухгалтерская книга', definition: 'A book that records money received and spent.', example: 'Ashford checked every payment in the ledger.' },
  { id: 'receipt', word: 'receipt', phonetic: '/rɪˈsiːt/', translation: 'расписка; квитанция', definition: 'A written record that something was paid for or received.', example: 'Keep the receipt after you pay for the parcel.' },
  { id: 'debt', word: 'debt', phonetic: '/det/', translation: 'долг', definition: 'Money that you must pay back to someone.', example: 'She worked hard to pay her debt to the bank.' },
  { id: 'poison', word: 'poison', phonetic: '/ˈpɔɪzən/', translation: 'яд', definition: 'A substance that can make someone very ill or cause death.', example: 'The detective asked whether the drink contained poison.' },
  { id: 'thread', word: 'thread', phonetic: '/θred/', translation: 'нить', definition: 'A long, thin piece of cotton, wool, or another material.', example: 'There was a loose thread on his sleeve.' },
  { id: 'torn', word: 'torn', phonetic: '/tɔːn/', translation: 'порванный; оторванный', definition: 'Pulled apart or damaged by pulling; the past participle of tear.', example: 'She kept a torn piece of an old newspaper.' },
  { id: 'signature', word: 'signature', phonetic: '/ˈsɪɡnətʃə/', translation: 'подпись', definition: 'Your name written in your own special way.', example: 'The inspector compared the two signatures.' },
  { id: 'confirm', word: 'confirm', phonetic: '/kənˈfɜːm/', translation: 'подтверждать', definition: 'To show or say that something is true.', example: 'Can you confirm the time of your arrival?' },
  { id: 'motive', word: 'motive', phonetic: '/ˈməʊtɪv/', translation: 'мотив', definition: 'A reason for doing something, especially a crime.', example: 'A detective must look for a motive before making an accusation.' },
  { id: 'rough', word: 'rough', phonetic: '/rʌf/', translation: 'грубый; шероховатый', definition: 'Not smooth or soft when you touch it.', example: 'The rough paper felt old and dry.' },
  { id: 'accuse', word: 'accuse', phonetic: '/əˈkjuːz/', translation: 'обвинять', definition: 'To say that someone has done something wrong.', example: 'Do not accuse a person without evidence.' },
  { id: 'deduce', word: 'deduce', phonetic: '/dɪˈdjuːs/', translation: 'делать логический вывод', definition: 'To find an answer by thinking carefully about known facts.', example: 'What can you deduce from the two official times?' }
];
