import { AnatomySystem } from '../types/anatomy';

export const anatomySystems: AnatomySystem[] = [
  {
    id: 'skeletal',
    name: 'Skeletal System',
    threedmodel: 'https://mywebar.com/p/Project_0_6qjyeysu5d',
    description: 'The framework of bones that supports and protects the body',
    imageUrl: 'https://1.bp.blogspot.com/-ZJH1Wb4cejA/X_UBJs1cbYI/AAAAAAAAKd0/KPibosJhi2U3MqDfBIsOb8aw8npZx1PQACLcBGAsYHQ/s2048/skeleton.jpg',
    category: 'systems',
    difficulty: 'beginner',
    keyPoints: [
      '206 bones in the adult human body',
      'Provides structural support and protection',
      'Produces blood cells in bone marrow',
      'Stores minerals like calcium and phosphorus'
    ],
    funFacts: [
      'The femur is the longest bone in the human body',
      'Bones are actually living tissue that constantly regenerates',
      'The smallest bone is the stapes in the ear'
    ],
    relatedSystems: ['muscular', 'circulatory'],
    htmlnotesName: "Ar_skeleton.html"
  },
  {
    id: 'kidney',
    name: 'Kidney',
    threedmodel: 'https://mywebar.com/p/Project_0_r16wi1kd2y',
    description: 'A paired organ that filters blood to remove waste products, regulate fluid and electrolyte balance, and help control blood pressure.',
    imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.q0kqJWWE9-I0OoL-xOdR2wAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'systems',
    difficulty: 'intermediate',
    keyPoints: [
      'Filter waste products and excess fluid from the blood to form urine',
      'Regulate electrolyte and acid–base balance',
      'Contain functional units called nephrons that perform filtration and reabsorption',
      'Contribute to blood pressure regulation via hormone secretion (e.g., renin)'
    ],
    funFacts: [
      'Kidneys filter roughly 120–150 quarts of blood daily to produce about 1–2 quarts of urine',
      'Each kidney contains about one million nephrons, the microscopic filtering units',
      'Kidneys help activate vitamin D, which supports calcium balance'
    ],
    relatedSystems: ['circulatory', 'endocrine'],
    htmlnotesName: "Ar_kidney.html"
  },
  {
    id: 'heart',
    name: 'Heart',
    threedmodel: 'https://mywebar.com/p/Project_2_ddtqyvws24',
    description: 'A muscular organ that pumps blood through the pulmonary and systemic circuits to deliver oxygen and nutrients and remove waste.',
    imageUrl: 'https://p.turbosquid.com/ts-thumb/z2/IaTtq6/Cr7U0Y7M/sig0000/jpg/1562528759/600x600/fit_q87/08e1b218672ba8c67c9b219f1919dfa80faa5f6b/sig0000.jpg',
    category: 'systems',
    difficulty: 'intermediate',
    keyPoints: [
      'Four chambers: two atria (upper) and two ventricles (lower)',
      'Valves ensure one-way blood flow and prevent backflow',
      'Cardiac muscle (myocardium) contracts rhythmically to generate pressure',
      'Coronary circulation supplies the heart muscle with oxygen and nutrients'
    ],
    funFacts: [
      'The heart beats roughly 60–100 times per minute at rest in healthy adults',
      'Cardiac output varies with activity to meet the body’s demands',
      'The left ventricle has the thickest wall to pump blood to the whole body'
    ],
    relatedSystems: ['respiratory', 'lymphatic'],
    htmlnotesName: "Ar_Heart.html"
  },
  {
    id: 'brain',
    name: 'Brain',
    threedmodel: 'https://mywebar.com/p/Project_0_8r3xbbthb6',
    description: 'The central organ of the nervous system responsible for processing sensory input, coordinating movement, and supporting cognition.',
    imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.zJvZKgdMd5HQkqUrgZ8YJgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3',
    category: 'systems',
    difficulty: 'advanced',
    keyPoints: [
      'Central nervous system comprises the brain and spinal cord',
      'Processes sensory information and issues motor commands',
      'Supports higher functions: memory, language, and decision making',
      'Communicates via electrically and chemically mediated signals'
    ],
    funFacts: [
      'The brain contains roughly 86 billion neurons',
      'Nerve impulses can travel rapidly along myelinated fibers',
      'The brain consumes a substantial portion of the body\'s energy despite its small mass'
    ],
    relatedSystems: ['muscular', 'endocrine'],
    htmlnotesName: "Ar_Brain.html"
  },
  {
    id: 'respiratory',
    name: 'Lungs',
    threedmodel: 'https://mywebar.com/p/Project_0_hcsf0vfbtz',
    description: 'The lungs and airways that enable breathing and gas exchange between air and blood.',
    imageUrl: 'https://media.sketchfab.com/models/066a1eafdcf54865b4c6b8688dac5834/thumbnails/98e7a275be7a4366a44860a2f0c4ed91/fc7505af33ad4247b36bd1d83cd53d0f.jpeg',
    category: 'systems',
    difficulty: 'beginner',
    keyPoints: [
      'Primary function is gas exchange (oxygen into blood, carbon dioxide out)',
      'Air travels through nose, trachea, bronchi, and bronchioles to reach alveoli',
      'Alveoli are tiny air sacs with a large surface area for efficient exchange',
      'Works closely with the circulatory system to deliver oxygen to tissues'
    ],
    funFacts: [
      'We breathe about 20,000 times per day on average',
      'Healthy lungs contain roughly 300 million alveoli',
      'The combined surface area of alveoli is very large, aiding gas exchange'
    ],
    relatedSystems: ['circulatory', 'muscular'],
    htmlnotesName: "Ar_Lungs.html"
  },
  {
    id: 'eye',
    name: 'Eye',
    threedmodel: 'https://mywebar.com/p/Project_0_jvgmo5vo4z',
    description: 'A sensory organ that detects light and enables vision by focusing images onto the retina.',
    imageUrl: 'https://cdna.artstation.com/p/assets/images/images/026/148/004/large/alexander-beim-hyper-realistic-human-eye-iris-3d-cg-alexander-beim.jpg?1588008829',
    category: 'systems',
    difficulty: 'intermediate',
    keyPoints: [
      'Light enters the eye through the cornea and is focused by the lens onto the retina',
      'The retina contains photoreceptor cells (rods and cones) that convert light into neural signals',
      'The optic nerve transmits visual information from the retina to the brain',
      'The iris controls pupil size to regulate the amount of light entering the eye'
    ],
    funFacts: [
      'The human eye can distinguish millions of colors',
      'Rods are sensitive to low light while cones support color vision and acuity',
      'The fovea is a small retinal region responsible for sharp central vision'
    ],
    relatedSystems: ['circulatory', 'nervous'],
    htmlnotesName: "Ar_eye.html"
  }
];