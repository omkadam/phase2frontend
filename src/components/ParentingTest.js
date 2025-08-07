import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Save,
  User,
  Brain,
  Heart,
  Calendar,
} from "lucide-react";

const MBTIQuestionnaire = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [currentFollowUp, setCurrentFollowUp] = useState(null);
  const [isComplete, setIsComplete] = useState(false);
  const [userId, setUserId] = useState("");

  // Question data based on your format
  const questions = [
    {
      id: 1,
      baseQuestion:
        "Do you enjoy spending long periods alone without feeling drained?",
      baseOptions: ["Yes", "Sometimes", "No", "It depends"],
      followUpTrigger: ["Yes", "Sometimes"],
      followUpQuestion: "What do you usually prefer in your free time?",
      followUpOptions: [
        "Reading or solo activities",
        "Group events",
        "Social media",
        "Creative projects",
      ],
      mbtiImpact: "If 'Yes' or 'Sometimes' → I, if 'No' → E",
      category: "Energy Direction",
    },
    {
      id: 2,
      baseQuestion: "Do you often rely on your gut instinct while parenting?",
      baseOptions: ["Yes", "Occasionally", "Rarely", "No"],
      followUpTrigger: ["Yes", "Occasionally"],
      followUpQuestion: "How does your intuition usually guide you?",
      followUpOptions: [
        "Through feelings",
        "Through body signals",
        "Through dreams, flashes, or metaphors",
        "I'm not sure",
      ],
      mbtiImpact: "If 'Yes' or 'Occasionally' → N, if 'Rarely' or 'No' → S",
      category: "Information Processing",
    },
    {
      id: 3,
      baseQuestion:
        "When making decisions for your child, do you focus more on logic or feelings?",
      baseOptions: [
        "Purely logical",
        "Mostly logical",
        "Balanced",
        "Mostly feelings",
        "Purely emotional",
      ],
      followUpTrigger: ["Purely logical", "Mostly logical"],
      followUpQuestion:
        "How do you ensure your child's emotions are accounted for?",
      followUpOptions: [
        "Ask them directly",
        "Observe body language",
        "Guess based on past",
        "I don't focus on that",
      ],
      mbtiImpact:
        "If 'Purely' or 'Mostly logical' → T, if 'Mostly feelings' or 'Emotional' → F, if 'Balanced' → T & F equally",
      category: "Decision Making",
    },
    {
      id: 4,
      baseQuestion:
        "Do you find sudden changes in your child's schedule difficult to manage?",
      baseOptions: [
        "Yes, very much",
        "Somewhat",
        "No, I adapt easily",
        "Depends on the day",
      ],
      followUpTrigger: ["Yes, very much", "Somewhat"],
      followUpQuestion: "How do you usually respond to such changes?",
      followUpOptions: [
        "I get frustrated",
        "I try to adjust but feel anxious",
        "I stay calm",
        "I avoid addressing it",
      ],
      mbtiImpact:
        "If 'Yes' or 'Somewhat' → J, if 'Adapt easily' or 'Depends' → P",
      category: "Structure Preference",
    },
    {
      id: 5,
      baseQuestion:
        "Are you more energized by interacting with your child or by taking space for yourself?",
      baseOptions: [
        "Interacting energizes me",
        "I enjoy both equally",
        "Space helps me recharge",
        "Depends on mood",
      ],
      followUpTrigger: ["Space helps me recharge", "Depends on mood"],
      followUpQuestion: "How do you recharge effectively as a parent?",
      followUpOptions: [
        "Quiet walk or nap",
        "Do something creative",
        "Journal or reflect",
        "Zone out on screens",
      ],
      mbtiImpact:
        "If 'Space' or 'Depends' → I, if 'Interacting' → E, if 'Both equally' → I & E equally",
      category: "Energy Source",
    },
    {
      id: 6,
      baseQuestion:
        "Do you need time to mentally prepare before engaging with your child emotionally?",
      baseOptions: [
        "Yes, always",
        "Sometimes",
        "Not really",
        "Never thought about it",
      ],
      followUpTrigger: ["Yes, always", "Sometimes"],
      followUpQuestion: "What kind of preparation helps you most?",
      followUpOptions: [
        "Thinking through conversations",
        "Breathing or meditation",
        "Reviewing past experiences",
        "Being alone briefly",
      ],
      mbtiImpact:
        "If 'Yes' or 'Sometimes' → I, if 'Not really' or 'Never thought' → E",
      category: "Emotional Preparation",
    },
    {
      id: 7,
      baseQuestion:
        "When your child shares something personal, how do you typically respond?",
      baseOptions: [
        "Listen silently",
        "Offer comfort",
        "Try to solve",
        "Change topic",
      ],
      followUpTrigger: ["Listen silently", "Offer comfort"],
      followUpQuestion: "What are you hoping to achieve in that moment?",
      followUpOptions: [
        "Connection",
        "Reassurance",
        "Teaching a lesson",
        "Moving past it",
      ],
      mbtiImpact:
        "If 'Listen' or 'Comfort' → F, if 'Solve' or 'Change topic' → T",
      category: "Communication Style",
    },
    {
      id: 8,
      baseQuestion: "Do you enjoy long imaginative play with your child?",
      baseOptions: [
        "Yes, I love it",
        "Sometimes",
        "I find it tiring",
        "I avoid it",
      ],
      followUpTrigger: ["I find it tiring", "I avoid it"],
      followUpQuestion: "What about it feels difficult?",
      followUpOptions: [
        "Don't know how to play",
        "Feels pointless",
        "Drains energy",
        "Feels silly",
      ],
      mbtiImpact: "If 'Tiring' or 'Avoid' → S, if 'Yes' or 'Sometimes' → N",
      category: "Imaginative Engagement",
    },
    {
      id: 9,
      baseQuestion:
        "When your child interrupts your thinking or focus, how do you react?",
      baseOptions: [
        "Respond kindly",
        "Slightly annoyed",
        "Ask them to wait",
        "Ignore",
      ],
      followUpTrigger: ["Slightly annoyed", "Ask them to wait"],
      followUpQuestion: "What do you feel internally in that moment?",
      followUpOptions: ["Irritated", "Guilty", "Tired", "Conflicted"],
      mbtiImpact:
        "If 'Slightly annoyed' or 'Ask to wait' → J, if 'Kind' or 'Ignore' → P",
      category: "Focus Management",
    },
    {
      id: 10,
      baseQuestion:
        "Are you more drawn to routine or spontaneity in your parenting?",
      baseOptions: [
        "Love routine",
        "Prefer structure with flexibility",
        "Go with the flow",
        "Very spontaneous",
      ],
      followUpTrigger: ["Love routine", "Prefer structure with flexibility"],
      followUpQuestion: "How do you handle unexpected moments with your child?",
      followUpOptions: [
        "Feel anxious",
        "Bring structure back",
        "Enjoy surprise",
        "Get frustrated",
      ],
      mbtiImpact:
        "If 'Routine' or 'Structure' → J, if 'Flow' or 'Spontaneous' → P",
      category: "Routine vs Flexibility",
    },
    {
      id: 11,
      baseQuestion:
        "When your child refuses to do their homework, how do you usually respond?",
      baseOptions: [
        "I calmly explain why it’s important and offer help",
        " I insist they do it right away, no excuses ",
        " I say it’s their choice and let it go",
        "I ignore it or feel too tired to engage",
      ],
      followUpTrigger: [
        "I calmly explain why it’s important and offer help",
        "I insist they do it right away, no excuses",
        "I say it’s their choice and let it go",
        "I ignore it or feel too tired to engage",
      ],
      followUpQuestion: "Why do you choose to respond this way?",
      followUpOptions: [
        "I want them to understand responsibility",
        " I believe strictness builds discipline",
        " I don’t want to pressure them",
        " I don’t have the energy to deal with it",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 12,
      baseQuestion:
        "How do you react when your child questions your rules or decisions?",
      baseOptions: [
        " I explain the reasons patiently",
        "  I get firm and say they must obey ",
        " I laugh or change the topic",
        " I avoid answering altogether",
      ],
      followUpTrigger: [
        "I get firm and say they must obey",
        "I laugh or change the topic",
        "I avoid answering altogether",
      ],
      followUpQuestion: "Why is it difficult to engage with their questioning?",
      followUpOptions: [
        "It feels disrespectful",
        "I don’t want to argue",
        "I feel unsure ",
        "I was never allowed to question rules",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 13,
      baseQuestion:
        "When your child makes a mistake or breaks something, how do you respond?",
      baseOptions: [
        " I help them understand and repair it",
        "   I scold or punish them ",
        " I say it’s okay and move on",
        " I don’t respond or change the subject",
      ],
      followUpTrigger: [
        " I scold or punish them",
        "I say it’s okay and move on",
        "I don’t respond or change the subject",
      ],
      followUpQuestion: "What guides your reaction in such moments?",
      followUpOptions: [
        "They must learn a lesson",
        "It’s not a big deal",
        "I’m too tired to deal with it",
        "Mistakes are personal failures",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 14,
      baseQuestion:
        "When your child interrupts or misbehaves during a family event, what’s your go-to action?",
      baseOptions: [
        "Talk to them privately and set boundaries ",
        "Scold them in front of others ",
        "Laugh it off or let it go",
        "Say nothing and hope it passes",
      ],
      followUpTrigger: [
        "Talk to them privately and set boundaries",
        "Scold them in front of others",
        "Laugh it off or let it go",
        "Say nothing and hope it passes",
      ],
      followUpQuestion: "What are you hoping to achieve with this reaction?",
      followUpOptions: [
        "Model respectful behavior",
        "Teach discipline",
        "Keep peace",
        "Avoid embarrassment",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 15,
      baseQuestion:
        "When it comes to household rules, how do you create and enforce them?",
      baseOptions: [
        "Together with my child, and clearly explained",
        "I make the rules and expect them to follow",
        "I prefer to be flexible",
        "I don’t really enforce rules",
      ],
      followUpTrigger: [
        "I make the rules and expect them to follow",
        "I prefer to be flexible",
        "I don’t really enforce rules",
      ],
      followUpQuestion: "How do you feel about setting rules?",
      followUpOptions: [
        "Necessary to maintain order",
        "Draining or exhausting",
        "I want my child to feel free",
        "I’m unsure what’s best",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 16,
      baseQuestion:
        "When it comes to household rules, how do you create and enforce them?",
      baseOptions: [
        "Together with my child, and clearly explained",
        "I make the rules and expect them to follow",
        "I prefer to be flexible",
        "I don’t really enforce rules",
      ],
      followUpTrigger: [
        "I make the rules and expect them to follow",
        "I prefer to be flexible",
        "I don’t really enforce rules",
      ],
      followUpQuestion: "How do you feel about setting rules?",
      followUpOptions: [
        "Necessary to maintain order",
        "Draining or exhausting",
        "I want my child to feel free",
        "I’m unsure what’s best",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 17,
      baseQuestion:
        "What’s your reaction when your child expresses strong emotions like anger or sadness?",
      baseOptions: [
        "I stay present and help them express it",
        " I tell them to calm down or stop ",
        " I try to distract or joke",
        "I avoid dealing with it",
      ],
      followUpTrigger: [
        "I tell them to calm down or stop",
        "I try to distract or joke",
        "I avoid dealing with it",
      ],
      followUpQuestion: "What do you believe about emotional expression?",
      followUpOptions: [
        "It’s important to process emotions",
        " It’s disruptive",
        " It makes me uncomfortable",
        " It’s better not to feel too much",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 18,
      baseQuestion:
        "When your child accomplishes something small or big, how do you usually respond?",
      baseOptions: [
        "Acknowledge it warmly and ask how they feel",
        "Say ‘good job’ and move on",
        "Let them enjoy without comment ",
        "Miss the moment entirely",
      ],
      followUpTrigger: [
        "Say ‘good job’ and move on",
        "Let them enjoy without comment",
        "Miss the moment entirely",
      ],
      followUpQuestion: "What’s your reason for responding that way?",
      followUpOptions: [
        "I want them to feel seen",
        "I don’t want to overpraise",
        "It didn’t feel like a big deal",
        "I wasn’t paying attention",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 19,
      baseQuestion:
        "How often do you discuss your child’s feelings and choices with them?",
      baseOptions: [
        "Regularly and openly",
        "Only when there’s a problem",
        "Rarely",
        "I avoid emotional conversations",
      ],
      followUpTrigger: [
        "Only when there’s a problem",
        "Rarely",
        "I avoid emotional conversations",
      ],
      followUpQuestion: "What prevents more open discussion?",
      followUpOptions: [
        "Time constraints",
        " I don’t know how",
        " I wasn’t raised that way",
        "It feels unnecessary",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 20,
      baseQuestion:
        "If your child breaks a boundary you’ve set (like screen time or bedtime), what do you do?",
      baseOptions: [
        "Reinforce the boundary and talk about why",
        "Impose a consequence immediately",
        "Let it slide",
        "Say nothing and hope it fixes itself",
      ],
      followUpTrigger: [
        "Reinforce the boundary and talk about why",
        "Impose a consequence immediately",
        "Let it slide",
        "Say nothing and hope it fixes itself",
      ],
      followUpQuestion: "What is your intention behind this reaction?",
      followUpOptions: [
        "Teach self-regulation",
        "Maintain discipline",
        "Avoid conflict",
        "Don’t know how to respond",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 21,
      baseQuestion: "How would you describe your relationship with your child?",
      baseOptions: [
        "Warm, open, and respectful",
        "Respectful but strict",
        "Friendly but chaotic",
        "Distant or unclear",
      ],
      followUpTrigger: [
        "Respectful but strict",
        "Friendly but chaotic",
        "Distant or unclear",
      ],
      followUpQuestion: "What do you wish was different?",
      followUpOptions: [
        "More understanding",
        "Less stress",
        "More respect",
        "More closeness",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 22,
      baseQuestion:
        "When your child breaks a rule, what feels most natural to you in that moment?",
      baseOptions: [
        "Lay down consequences so they learn responsibility",
        "Get visibly upset because it keeps happening",
        "Try to understand what led them to break the rule",
        "Offer reassurance and then explain gently",
      ],
      followUpTrigger: [
        "Get visibly upset because it keeps happening",
        "Offer reassurance and then explain gently",
      ],
      followUpQuestion:
        "What message do you hope your child receives in that moment?",
      followUpOptions: [
        "That rules matter",
        "That I’m serious",
        "That I care",
        "That mistakes are okay",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 23,
      baseQuestion:
        "When your child resists doing something (like homework), what’s your typical response?",
      baseOptions: [
        "I set a clear boundary with firmness",
        " I raise my voice or express irritation",
        " I offer help and try to connect with how they feel",
        " I let it go for now — they’ll come around",
      ],
      followUpTrigger: [
        " I raise my voice or express irritation",
        "I let it go for now — they’ll come around",
      ],
      followUpQuestion: "Why do you think this approach feels natural to you?",
      followUpOptions: [
        "That’s how I was raised",
        "I don’t want conflict",
        " It works quickly",
        " I feel unsure",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 24,
      baseQuestion:
        "How do you talk to your child when correcting their behavior?",
      baseOptions: [
        "Calm, firm, and consistent — it’s about structure",
        "Strict and intense — so they know I’m serious",
        "Kind but honest — I explain how it affects others",
        "Gentle and accommodating — I don’t want to upset them",
      ],
      followUpTrigger: [
        "Strict and intense — so they know I’m serious",
        "Gentle and accommodating — I don’t want to upset them",
      ],
      followUpQuestion:
        "What do you believe is the impact of this tone on your child?",
      followUpOptions: [
        "They’ll behave better",
        "They’ll feel safe",
        "They’ll get confused ",
        "It depends on the child",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 25,
      baseQuestion:
        "When your child is struggling emotionally, what’s your instinct?",
      baseOptions: [
        "Help them refocus and move on with the task ",
        "Tell them to toughen up or stop overreacting ",
        "Validate their feelings and support them through it ",
        "Try to distract them or soothe without talking too much",
      ],
      followUpTrigger: [
        "Tell them to toughen up or stop overreacting",
        "Try to distract them or soothe without talking too much",
      ],
      followUpQuestion:
        "When your child is upset, what makes it hard for you to stay present?",
      followUpOptions: [
        "It reminds me of my own struggles",
        "I feel helpless",
        " I want to fix it quickly ",
        " I don’t know what to say",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 26,
      baseQuestion:
        "If your child challenges your authority or questions your rules, how do you feel?",
      baseOptions: [
        "I hold my ground calmly and reassert the rule",
        "I feel disrespected and respond strongly",
        "I welcome the conversation and explain my reasoning",
        "I try to avoid conflict or let it slide",
      ],
      followUpTrigger: [
        "I feel disrespected and respond strongly",
        "I try to avoid conflict or let it slide",
      ],
      followUpQuestion:
        "What’s your inner dialogue when your child questions you?",
      followUpOptions: [
        "They should trust me",
        "I’m losing control",
        "This is healthy",
        "I feel attacked",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 27,
      baseQuestion: "As a child, how did you express joy or creativity?",
      baseOptions: [
        "I was imaginative and playful, and encouraged often",
        " I expressed myself only when it felt safe",
        " I was told I was being silly or dramatic",
        " I rarely had the space or freedom to express creatively",
      ],
      followUpTrigger: [
        " I was told I was being silly or dramatic",
        " I rarely had the space or freedom to express creatively",
      ],
      followUpQuestion: "How did adults respond to your creativity?",
      followUpOptions: [
        "They discouraged it",
        "They laughed",
        "They didn’t notice",
        "They tried but didn’t get it",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 28,
      baseQuestion:
        "When you were upset as a child, how did adults usually respond?",
      baseOptions: [
        "They listened and let me express myself freely, even if it got messy",
        "They listened and helped me understand and regulate my feelings",
        "They told me I was being too sensitive or dramatic",
        "They told me to be strong or stop crying immediately",
      ],
      followUpTrigger: [
        "They told me I was being too sensitive or dramatic",
        "They told me to be strong or stop crying immediately",
      ],
      followUpQuestion:
        "What message do you think you internalized from those responses?",
      followUpOptions: [
        "That big emotions are embarrassing",
        "That I needed to hide my feelings to be accepted",
        "That strong people don’t cry",
        "That being emotional makes others uncomfortable",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 29,
      baseQuestion: "How often were your emotions welcomed at home?",
      baseOptions: [
        "Often — I could be myself and felt safe sharing",
        " Sometimes — depending on the mood at home",
        "Rarely — I had to manage on my own",
        "Never — it felt unsafe or pointless to share",
      ],
      followUpTrigger: [
        "Rarely — I had to manage on my own",
        "Never — it felt unsafe or pointless to share",
      ],
      followUpQuestion: "How did it feel to hold back your emotions?",
      followUpOptions: ["Lonely ", " Safe but empty", "Normal ", "Painful"],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 30,
      baseQuestion:
        "Which of these describes your experience of being ‘good’ as a child?",
      baseOptions: [
        "I was encouraged to follow rules and express myself",
        " I learned to stay quiet, polite, and not make trouble",
        " I felt pressure to be perfect or make others happy",
        "I didn’t feel noticed, even when I behaved well",
      ],
      followUpTrigger: [
        "I learned to stay quiet, polite, and not make trouble",
        "I didn’t feel noticed, even when I behaved well",
      ],
      followUpQuestion: "What belief about goodness did you carry forward?",
      followUpOptions: [
        "Be invisible  ",
        " Please others",
        "Stay quiet = be loved ",
        "Good kids don't ask for much",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 31,
      baseQuestion:
        "Looking back, what did you most wish adults had done differently?",
      baseOptions: [
        "Encouraged me to play and express more freely",
        " Taken my feelings seriously without brushing them off",
        " Let me make mistakes without fear of punishment",
        "Spent more time understanding who I really was",
      ],
      followUpTrigger: [
        "Taken my feelings seriously without brushing them off",
        "Spent more time understanding who I really was",
      ],
      followUpQuestion:
        "How would that have changed your childhood experience?",
      followUpOptions: [
        "I’d feel seen",
        "I’d trust adults more",
        " I’d express myself more",
        "I’d feel safer inside",
      ],
      mbtiImpact:
        "If Calmly explain and offer help: Authoritative ? Insist they do it' = Authoritarian ? 'Say it’s their choice' = Permissive ? Ignore it or feel too tired' = Uninvolved.",
      category: "Routine vs Flexibility",
    },
    {
      id: 32,
      baseQuestion:
        "When your child cries or expresses big emotions, how do you typically respond?",
      baseOptions: [
        "I feel calm and try to support them",
        "I get uncomfortable and want them to stop",
        "I feel helpless or overwhelmed",
        "I tell them to toughen up or move on",
      ],
      followUpTrigger: [
        "any option other than 'I feel calm and try to support them'",
      ],
      followUpQuestion: "What makes it difficult to support their emotions?",
      followUpOptions: [
        "It feels like too much",
        "I was never supported this way",
        "I freeze",
        "I think they should manage it alone",
      ],
      mbtiImpact:
        "If 'I feel calm and try to support them' \u2192 Need for Emotional Expression was met; Else \u2192 Need for Emotional Expression was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 33,
      baseQuestion: "When your child makes a mistake, how do you react?",
      baseOptions: [
        "Help them learn without shame",
        "Correct them firmly",
        "Feel annoyed",
        "Worry what others will think",
      ],
      followUpTrigger: [
        "any option other than 'Help them learn without shame'",
      ],
      followUpQuestion: "What do you believe about making mistakes?",
      followUpOptions: [
        "It should be avoided",
        "It invites judgment",
        "It's embarrassing",
        "It's part of learning",
      ],
      mbtiImpact:
        "If 'Help them learn without shame' \u2192 Need for Acceptance was met; Else \u2192 Need for Acceptance was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 34,
      baseQuestion:
        "When your child wants to play freely or be silly, how do you feel?",
      baseOptions: [
        "Delighted and join in",
        "Irritated",
        "Dismissive",
        "Disconnected",
      ],
      followUpTrigger: ["any option other than 'Delighted and join in'"],
      followUpQuestion: "What do you think about being silly or playful?",
      followUpOptions: [
        "It wastes time",
        "I wasn\u2019t allowed to be",
        "I don't relate",
        "It\u2019s beautiful",
      ],
      mbtiImpact:
        "If 'Delighted and join in' \u2192 Need for Freedom to Play was met; Else \u2192 Need for Freedom to Play was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 35,
      baseQuestion:
        "How do you respond when your child questions rules or instructions?",
      baseOptions: [
        "Explain the reasoning",
        "Shut it down",
        "Feel threatened",
        "Ignore",
      ],
      followUpTrigger: ["any option other than 'Explain the reasoning'"],
      followUpQuestion: "Why do you think their questioning bothers you?",
      followUpOptions: [
        "It feels disrespectful",
        "I was never allowed to question",
        "I fear losing control",
        "It\u2019s frustrating",
      ],
      mbtiImpact:
        "If 'Explain the reasoning' \u2192 Need for Autonomy was met; Else \u2192 Need for Autonomy was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 36,
      baseQuestion:
        "How do you feel when your child seeks your attention constantly?",
      baseOptions: ["Warm and present", "Annoyed", "Drained", "Uncomfortable"],
      followUpTrigger: ["any option other than 'Warm and present'"],
      followUpQuestion: "What\u2019s your first thought in those moments?",
      followUpOptions: [
        "They\u2019re too needy",
        "I need space",
        "I\u2019m failing",
        "I feel lucky",
      ],
      mbtiImpact:
        "If 'Warm and present' \u2192 Need for Being Seen was met; Else \u2192 Need for Being Seen was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 37,
      baseQuestion: "How do you feel when your child shows strong opinions?",
      baseOptions: ["Curious", "Defensive", "Frustrated", "Try to silence it"],
      followUpTrigger: ["any option other than 'Curious'"],
      followUpQuestion: "What bothers you about their strong views?",
      followUpOptions: [
        "It feels confrontational",
        "I don\u2019t like disagreement",
        "I never spoke up",
        "I admire it",
      ],
      mbtiImpact:
        "If 'Curious' \u2192 Need for Voice was met; Else \u2192 Need for Voice was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 38,
      baseQuestion:
        "When your child is slow or unmotivated, how do you respond?",
      baseOptions: [
        "Encourage gently",
        "Push them harder",
        "Judge silently",
        "Feel disappointed",
      ],
      followUpTrigger: ["any option other than 'Encourage gently'"],
      followUpQuestion: "Why do you think their slowness bothers you?",
      followUpOptions: [
        "They won\u2019t succeed",
        "I was punished for it",
        "I don\u2019t understand it",
        "I value effort",
      ],
      mbtiImpact:
        "If 'Encourage gently' \u2192 Need for Patience and Growth was met; Else \u2192 Need for Patience and Growth was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 39,
      baseQuestion:
        "When your child expresses fear or worry, what\u2019s your typical reaction?",
      baseOptions: [
        "Offer comfort and listen",
        "Tell them not to worry",
        "Feel uneasy",
        "Brush it off",
      ],
      followUpTrigger: ["any option other than 'Offer comfort and listen'"],
      followUpQuestion: "What do you believe about showing fear?",
      followUpOptions: [
        "It\u2019s weakness",
        "It\u2019s valid",
        "I wasn\u2019t allowed to",
        "They should toughen up",
      ],
      mbtiImpact:
        "If 'Offer comfort and listen' \u2192 Need for Safety was met; Else \u2192 Need for Safety was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 40,
      baseQuestion:
        "How do you feel when your child wants to do things on their own?",
      baseOptions: [
        "Proud and supportive",
        "Nervous",
        "I want to control it",
        "I feel rejected",
      ],
      followUpTrigger: ["any option other than 'Proud and supportive'"],
      followUpQuestion: "What about their independence is hard for you?",
      followUpOptions: [
        "I fear mistakes",
        "I feel irrelevant",
        "I wasn\u2019t trusted either",
        "It\u2019s wonderful",
      ],
      mbtiImpact:
        "If 'Proud and supportive' \u2192 Need for Trust was met; Else \u2192 Need for Trust was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 41,
      baseQuestion:
        "How do you react when your child doesn\u2019t meet your expectations?",
      baseOptions: [
        "Support them anyway",
        "Feel disappointed",
        "Withdraw emotionally",
        "Criticize",
      ],
      followUpTrigger: ["any option other than 'Support them anyway'"],
      followUpQuestion:
        "What meaning do you make of their \u2018failure\u2019?",
      followUpOptions: [
        "I\u2019m not a good parent",
        "They\u2019re not trying",
        "They\u2019ll fall behind",
        "It\u2019s okay to fail",
      ],
      mbtiImpact:
        "If 'Support them anyway' \u2192 Need for Unconditional Love was met; Else \u2192 Need for Unconditional Love was unmet",
      category: "Jungian Shadow Work (Unmet Needs)",
    },
    {
      id: 42,
      baseQuestion:
        "When your child becomes emotionally upset or distressed, what do you usually do first?",
      baseOptions: [
        "Hold them",
        "Offer advice",
        "Distract them",
        "Walk away",
        "Freeze or feel overwhelmed",
      ],
      followUpTrigger: [
        "Offer advice",
        "Distract them",
        "Walk away",
        "Freeze or feel overwhelmed",
      ],
      followUpQuestion: "Why do you think you respond in this way?",
      followUpOptions: [
        "It’s what I needed as a child",
        "I don’t know what else to do",
        "I feel uncomfortable with strong emotions",
        "I want to stay strong",
        "I panic or shut down",
      ],
      mbtiImpact:
        "If 'Hold them' → Secure Attachment Style; 'Offer advice' or 'Distract them' → Avoidant; 'Walk away' → Avoidant; 'Freeze or feel overwhelmed' → Anxious",
      category: "Attachment Theory",
    },
    {
      id: 43,
      baseQuestion:
        "How do you feel when your child becomes emotionally close or dependent on you for comfort?",
      baseOptions: [
        "Comfortable and connected",
        "Proud but unsure",
        "A little suffocated",
        "Emotionally burdened",
        "Anxious or confused",
      ],
      followUpTrigger: [
        "Proud but unsure",
        "A little suffocated",
        "Emotionally burdened",
        "Anxious or confused",
      ],
      followUpQuestion: "What makes this closeness challenging for you?",
      followUpOptions: [
        "Fear of losing control",
        "I wasn’t shown affection growing up",
        "I worry I’ll disappoint them",
        "I don’t feel equipped",
        "I never thought about it",
      ],
      mbtiImpact:
        "If 'Comfortable and connected' → Secure; 'A little suffocated' → Avoidant; 'Emotionally burdened' or 'Anxious or confused' → Disorganized; 'Proud but unsure' → Anxious",
      category: "Attachment Theory",
    },
    {
      id: 44,
      baseQuestion:
        "When your child pulls away or avoids sharing their feelings, what is your first thought?",
      baseOptions: [
        "They need space",
        "What did I do wrong?",
        "I feel rejected",
        "I feel relief",
        "I don’t know how to respond",
      ],
      followUpTrigger: "Always",
      followUpQuestion: "How do you usually respond in such moments?",
      followUpOptions: [
        "Give them distance",
        "Try to talk it out",
        "Feel anxious or hurt",
        "Get irritated",
        "Withdraw emotionally",
      ],
      mbtiImpact:
        "If 'What did I do wrong?' or 'I feel rejected' → Anxious; 'I feel relief' or 'Withdraw emotionally' → Avoidant; 'Feel anxious or hurt' or 'Don’t know how to respond' → Disorganized",
      category: "Attachment Theory",
    },
    {
      id: 45,
      baseQuestion: "How often do you worry about being a good enough parent?",
      baseOptions: [
        "Rarely",
        "Sometimes",
        "Often",
        "Constantly",
        "Only when things go wrong",
      ],
      followUpTrigger: ["Often", "Constantly"],
      followUpQuestion:
        "What thoughts go through your mind during such moments?",
      followUpOptions: [
        "I’ll fail them",
        "I’m like my parents",
        "I shouldn’t have had kids",
        "I need to fix this",
        "I’m not lovable",
      ],
      mbtiImpact: "If 'Rarely' → Secure; 'Often' or 'Constantly' → Anxious",
      category: "Attachment Theory",
    },
    {
      id: 46,
      baseQuestion: "How do you handle conflict with your child?",
      baseOptions: [
        "Talk it out calmly",
        "Raise voice or scold",
        "Withdraw",
        "Try to fix everything",
        "I shut down emotionally",
      ],
      followUpTrigger: "Always",
      followUpQuestion: "How do you usually feel after the conflict?",
      followUpOptions: [
        "Guilty",
        "Relieved",
        "Numb",
        "Disconnected",
        "Still angry",
        "Connected",
      ],
      mbtiImpact:
        "If 'Talk it out calmly' → Secure; 'Raise voice or scold' → Disorganized; 'Try to fix everything' → Anxious; 'Withdraw' or 'Shut down emotionally' → Avoidant",
      category: "Attachment Theory",
    },
    {
      id: 47,
      baseQuestion: "What kind of affection did you receive most growing up?",
      baseOptions: [
        "Warm and consistent",
        "Conditional on behavior",
        "Rare or minimal",
        "Confusing or unpredictable",
        "I don’t remember",
      ],
      followUpTrigger: [
        "Conditional on behavior",
        "Rare or minimal",
        "Confusing or unpredictable",
        "I don’t remember",
      ],
      followUpQuestion: "How did that affect your view of closeness?",
      followUpOptions: [
        "I learned to depend only on myself",
        "I became overly dependent",
        "I crave closeness but fear it",
        "I avoid closeness",
        "I still don’t know",
      ],
      mbtiImpact:
        "If 'Warm and consistent' → Secure; 'Conditional on behavior' → Anxious; 'Rare or minimal' → Avoidant; 'Confusing or unpredictable' → Disorganized",
      category: "Attachment Theory",
    },
    {
      id: 48,
      baseQuestion: "When your child needs comfort, do you usually...",
      baseOptions: [
        "Instinctively offer hugs or closeness",
        "Feel unsure what to do",
        "Offer logic or advice",
        "Wait for them to ask",
        "Avoid getting too involved",
      ],
      followUpTrigger: [
        "Feel unsure what to do",
        "Offer logic or advice",
        "Wait for them to ask",
        "Avoid getting too involved",
      ],
      followUpQuestion: "Why do you hold back or hesitate?",
      followUpOptions: [
        "I’m not sure how",
        "I worry I’ll do it wrong",
        "I wasn’t comforted much",
        "I don’t want to encourage neediness",
        "I’m emotionally tired",
      ],
      mbtiImpact:
        "If 'Instinctively offer hugs or closeness' → Secure; 'Feel unsure' → Anxious; 'Offer logic' or 'Wait for them to ask' or 'Avoid getting too involved' → Avoidant",
      category: "Attachment Theory",
    },
    {
      id: 49,
      baseQuestion: "Do you find it easy to emotionally open up to your child?",
      baseOptions: [
        "Yes, fully",
        "Sometimes",
        "Only when I’m in a good mood",
        "Not really",
        "I avoid emotional sharing",
      ],
      followUpTrigger: [
        "Sometimes",
        "Only when I’m in a good mood",
        "Not really",
        "I avoid emotional sharing",
      ],
      followUpQuestion: "What holds you back from emotional openness?",
      followUpOptions: [
        "Fear of appearing weak",
        "I never learned how",
        "I was taught to hide emotions",
        "I feel emotionally numb",
        "It feels unsafe",
      ],
      mbtiImpact:
        "If 'Yes, fully' → Secure; 'Sometimes' → Partial Secure/Anxious; 'Only when I’m in a good mood' or 'Not really' → Avoidant; 'I avoid emotional sharing' → Disorganized",
      category: "Attachment Theory",
    },
    {
      id: 50,
      baseQuestion:
        "When your child shows big emotions (like crying loudly or screaming), what’s your gut response?",
      baseOptions: [
        "Stay with them calmly",
        "Try to quiet them",
        "Feel overwhelmed",
        "Leave the room",
        "Panic or freeze",
      ],
      followUpTrigger: [
        "Try to quiet them",
        "Feel overwhelmed",
        "Leave the room",
        "Panic or freeze",
      ],
      followUpQuestion: "What does that moment feel like inside you?",
      followUpOptions: [
        "Chaos",
        "Panic",
        "Urge to fix",
        "Discomfort",
        "Emotional shutdown",
      ],
      mbtiImpact:
        "If 'Stay with them calmly' → Secure; 'Try to quiet them' → Avoidant; 'Feel overwhelmed' → Anxious; 'Leave the room' or 'Panic or freeze' → Disorganized",
      category: "Attachment Theory",
    },
    {
      id: 51,
      baseQuestion:
        "How do you feel when your child prefers another caregiver over you in emotional moments?",
      baseOptions: [
        "I understand",
        "I feel hurt",
        "I get insecure",
        "I try harder",
        "I act indifferent but feel bad",
      ],
      followUpTrigger: [
        "I feel hurt",
        "I get insecure",
        "I try harder",
        "I act indifferent but feel bad",
      ],
      followUpQuestion:
        "What do you believe this says about your relationship with your child?",
      followUpOptions: [
        "I’m not good enough",
        "I’m failing",
        "They’ll forget me",
        "I shouldn’t need them",
        "It’s okay, they’ll come back",
      ],
      mbtiImpact:
        "If 'I understand' → Secure; 'I feel hurt' or 'I get insecure' → Anxious; 'I try harder' → Disorganized; 'I act indifferent but feel bad' → Avoidant",
      category: "Attachment Theory",
    },
    {
      id: 52,
      baseQuestion:
        "How do you respond when your child strongly disagrees with you?",
      baseOptions: [
        "I listen and help them express themselves clearly",
        "I get upset and feel disrespected",
        "I try to convince them to think like me",
        "I say nothing and walk away",
      ],
      followUpTrigger: [
        "I get upset and feel disrespected",
        "I try to convince them to think like me",
        "I say nothing and walk away",
      ],
      followUpQuestion: "What makes disagreements hard for you?",
      followUpOptions: [
        "I wasn’t allowed to disagree growing up",
        "It feels like rejection",
        "I feel responsible to fix their thinking",
        "I get overwhelmed or confused",
      ],
      mbtiImpact:
        "If 'I listen and help them express themselves clearly' → Healthy Boundaries; 'I get upset and feel disrespected' or 'I try to convince them to think like me' → Enmeshed Boundaries; Else → Disengaged Boundaries",
      category: "Family Systems Theory",
    },
    {
      id: 53,
      baseQuestion: "How do you react when your child wants more independence?",
      baseOptions: [
        "I support them but stay involved",
        "I feel anxious and try to stay close",
        "I give them freedom but feel nervous",
        "I let them go and stay distant",
      ],
      followUpTrigger: [
        "I feel anxious and try to stay close",
        "I give them freedom but feel nervous",
        "I let them go and stay distant",
      ],
      followUpQuestion: "What does their independence trigger in you?",
      followUpOptions: [
        "Fear of being left behind",
        "Uncertainty about my role",
        "Pride mixed with fear",
        "Relief and guilt",
      ],
      mbtiImpact:
        "If 'I support them but stay involved' → Healthy Boundaries; 'I feel anxious and try to stay close' or 'I give them freedom but feel nervous' → Enmeshed Boundaries; Else → Disengaged Boundaries",
      category: "Family Systems Theory",
    },
    {
      id: 54,
      baseQuestion: "What do you do when your child wants privacy or space?",
      baseOptions: [
        "I respect their privacy with support",
        "I insist they tell me everything",
        "I feel shut out or offended",
        "I ignore them completely",
      ],
      followUpTrigger: [
        "I insist they tell me everything",
        "I feel shut out or offended",
        "I ignore them completely",
      ],
      followUpQuestion: "What about their privacy feels hard to accept?",
      followUpOptions: [
        "I fear losing connection",
        "It feels like rejection",
        "I feel powerless",
        "I feel they don’t trust me",
      ],
      mbtiImpact:
        "If 'I respect their privacy with support' → Healthy Boundaries; 'I insist they tell me everything' or 'I feel shut out or offended' → Enmeshed Boundaries; Else → Disengaged Boundaries",
      category: "Family Systems Theory",
    },
    {
      id: 55,
      baseQuestion:
        "When your child misbehaves, whose voice do you hear in your head?",
      baseOptions: [
        "My own parenting voice",
        "My parents or elders",
        "I go blank and react instinctively",
      ],
      followUpTrigger: [
        "My parents or elders",
        "I go blank and react instinctively",
      ],
      followUpQuestion:
        "What do you notice about how you sound in those moments?",
      followUpOptions: [
        "I sound like my parents",
        "I’m harsher than I want to be",
        "I repeat things I heard growing up",
        "I feel out of control",
      ],
      mbtiImpact:
        "If 'My own parenting voice' → Reparenting; 'My parents or elders' → Repeating Pattern; 'I go blank and react instinctively' → Overcorrecting",
      category: "Family Legacy Themes",
    },
    {
      id: 56,
      baseQuestion:
        "When your child is crying or upset, how do you usually respond?",
      baseOptions: [
        "I listen and validate their feelings",
        "I tell them to stop crying",
        "I freeze and don’t know what to do",
      ],
      followUpTrigger: [
        "I tell them to stop crying",
        "I freeze and don’t know what to do",
      ],
      followUpQuestion: "What makes their big emotions hard for you to handle?",
      followUpOptions: [
        "It reminds me of how I was treated",
        "I feel helpless",
        "I want to fix it fast",
        "It makes me anxious",
      ],
      mbtiImpact:
        "If 'I listen and validate their feelings' → Reparenting; 'I tell them to stop crying' or 'I freeze and don’t know what to do' → Repeating Pattern; Else → Overcorrecting",
      category: "Family Legacy Themes",
    },
    {
      id: 57,
      baseQuestion:
        "When you reflect on your parenting approach, what do you notice?",
      baseOptions: [
        "Doing things differently but still feel unsure",
        "Becoming like my parents",
        "Not knowing what I’m doing",
      ],
      followUpTrigger: [
        "Becoming like my parents",
        "Not knowing what I’m doing",
      ],
      followUpQuestion: "What emotions come up when you notice this?",
      followUpOptions: ["Guilt", "Confusion", "Determination", "Sadness"],
      mbtiImpact:
        "If 'Doing things differently but still feel unsure' → Reparenting; 'Becoming like my parents' → Repeating Pattern; 'Not knowing what I’m doing' → Overcorrecting",
      category: "Family Legacy Themes",
    },
    {
      id: 58,
      baseQuestion:
        "Which role best described how you behaved in your family growing up?",
      baseOptions: [
        "Responsible one (Caregiver)",
        "Peacemaker (Kept harmony)",
        "Rule-breaker (Rebel)",
        "Quiet or Invisible",
      ],
      followUpTrigger: [
        "Peacemaker (Kept harmony)",
        "Rule-breaker (Rebel)",
        "Quiet or Invisible",
      ],
      followUpQuestion: "Why do you think you chose that role?",
      followUpOptions: [
        "To feel needed",
        "To avoid conflict",
        "To be noticed",
        "To protect myself",
      ],
      mbtiImpact:
        "If includes 'Responsible' → Caregiver; includes 'Peacemaker' → Peacemaker; includes 'Rule-breaker' → Rebel; includes 'Quiet' → Invisible",
      category: "Family Systems Growing Roles",
    },
    {
      id: 59,
      baseQuestion:
        "When conflict arose at home, how did you usually respond as a child?",
      baseOptions: [
        "Try to fix it (Caregiver)",
        "Keep calm and stay quiet (Peacemaker)",
        "Express frustration (Rebel)",
        "Withdraw or disappear (Invisible)",
      ],
      followUpTrigger: [
        "Keep calm and stay quiet (Peacemaker)",
        "Express frustration (Rebel)",
        "Withdraw or disappear (Invisible)",
      ],
      followUpQuestion:
        "What did you hope would happen as a result of your reaction?",
      followUpOptions: [
        "Make things better",
        "Keep peace",
        "Feel heard",
        "Avoid pain",
      ],
      mbtiImpact:
        "If includes 'Fix it' → Caregiver; includes 'Keep calm' → Peacemaker; includes 'Express frustration' → Rebel; includes 'Withdraw' → Invisible",
      category: "Family Systems Growing Roles",
    },
  ];

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Energy Direction":
      case "Energy Source":
      case "Emotional Preparation":
        return <User className="w-5 h-5" />;
      case "Information Processing":
      case "Imaginative Engagement":
        return <Brain className="w-5 h-5" />;
      case "Decision Making":
      case "Communication Style":
        return <Heart className="w-5 h-5" />;
      case "Structure Preference":
      case "Focus Management":
      case "Routine vs Flexibility":
        return <Calendar className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  // Simulate database storage
  const saveToDatabase = async ({
    userId,
    questionId,
    questionType,
    answer,
  }) => {
    try {
      const res = await fetch("http://localhost:3001/api/series/parents/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, questionId, questionType, answer }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error("Failed to save response");
      }
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const saveMbtiResult = async (mbtiResult) => {
    try {
      await fetch(
        `http://localhost:3001/api/series/mbti-result/${userId || "anonymous"}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mbtiResult }),
        }
      );
    } catch (err) {
      console.error("❌ Error saving MBTI result:", err);
    }
  };

  const calculateMbtiFromResponses = (responses) => {
    const dimensions = {
      I: 0,
      E: 0,
      S: 0,
      N: 0,
      T: 0,
      F: 0,
      J: 0,
      P: 0,
    };

    const parentType = {
      Authoritative: 0,
      Authoritarian: 0,
      Permissive: 0,
      Uninvolved: 0,
    };

    const transactionalAnalysis = {
      cpPositive: 0,
      cpNegative: 0,
      npPositive: 0,
      npNegative: 0,
    };

    const transactionalAnalysisChild = {
      acPositive: 0,
      acNegative: 0,
      fcPositive: 0,
      fcNegative: 0,
    };

    const attachmentStyles = {
      Secure: 0,
      Avoidant: 0,
      Anxious: 0,
      Disorganized: 0,
    };

    const familySystemTheory = {
      healthyBoundaries: 0,
      enmeshedBoundaries: 0,
      disengagedBoundaries: 0,
    };
    const familyLegacyThemes = {
      Reparenting: 0,
      "Repeating Pattern": 0,
      Overcorrecting: 0,
    };

    const familySystemTheoryGrowing = {
      caregiver: 0,
      peacemaker: 0,
      rebel: 0,
      invisible: 0,
    };

    // ✅ Add unmet needs tracking here
    const unmetNeedsResults = {};

    for (let [key, value] of Object.entries(responses)) {
      if (key.includes("question_1_base")) {
        if (["Yes", "Sometimes"].includes(value)) dimensions.I++;
        else if (value === "No") dimensions.E++;
      }
      if (key.includes("question_2_base")) {
        if (["Yes", "Occasionally"].includes(value)) dimensions.N++;
        else dimensions.S++;
      }
      if (key.includes("question_3_base")) {
        if (["Purely logical", "Mostly logical"].includes(value))
          dimensions.T++;
        else if (["Mostly feelings", "Purely emotional"].includes(value))
          dimensions.F++;
        else if (value === "Balanced") {
          dimensions.T += 0.5;
          dimensions.F += 0.5;
        }
      }
      if (key.includes("question_4_base")) {
        if (["Yes, very much", "Somewhat"].includes(value)) dimensions.J++;
        else dimensions.P++;
      }
      if (key.includes("question_5_base")) {
        if (["Space helps me recharge", "Depends on mood"].includes(value))
          dimensions.I++;
        else if (value === "Interacting energizes me") dimensions.E++;
        else if (value === "I enjoy both equally") {
          dimensions.I += 0.5;
          dimensions.E += 0.5;
        }
      }
      if (key.includes("question_6_base")) {
        if (["Yes, always", "Sometimes"].includes(value)) dimensions.I++;
        else dimensions.E++;
      }
      if (key.includes("question_7_base")) {
        if (["Listen silently", "Offer comfort"].includes(value))
          dimensions.F++;
        else dimensions.T++;
      }
      if (key.includes("question_8_base")) {
        if (["I find it tiring", "I avoid it"].includes(value)) dimensions.S++;
        else dimensions.N++;
      }
      if (key.includes("question_9_base")) {
        if (["Slightly annoyed", "Ask them to wait"].includes(value))
          dimensions.J++;
        else dimensions.P++;
      }
      if (key.includes("question_10_base")) {
        if (
          ["Love routine", "Prefer structure with flexibility"].includes(value)
        )
          dimensions.J++;
        else dimensions.P++;
      }
      if (key.includes("question_11_base")) {
        if (
          ["I calmly explain why it’s important and offer help"].includes(value)
        )
          parentType.Authoritative++;
        else if (value === "I insist they do it right away, no excuses")
          parentType.Authoritarian++;
        else if (value === "I say it’s their choice and let it go")
          parentType.Permissive++;
        else if (value === " I ignore it or feel too tired to engage")
          parentType.Uninvolved++;
      }
      if (key.includes("question_12_base")) {
        if (["I explain the reasons patiently"].includes(value))
          parentType.Authoritative++;
        else if (value === "I get firm and say they must obey")
          parentType.Authoritarian++;
        else if (value === " I laugh or change the topic")
          parentType.Permissive++;
        else if (value === "I avoid answering altogether")
          parentType.Uninvolved++;
      }
      if (key.includes("question_13_base")) {
        if (["I help them understand and repair it"].includes(value))
          parentType.Authoritative++;
        else if (value === " I scold or punish them")
          parentType.Authoritarian++;
        else if (value === "I say it’s okay and move on")
          parentType.Permissive++;
        else if (value === " I don’t respond or change the subject")
          parentType.Uninvolved++;
      }
      if (key.includes("question_14_base")) {
        if (["Talk to them privately and set boundaries"].includes(value))
          parentType.Authoritative++;
        else if (value === "Scold them in front of others")
          parentType.Authoritarian++;
        else if (value === " Laugh it off or let it go")
          parentType.Permissive++;
        else if (value === "Say nothing and hope it passes")
          parentType.Uninvolved++;
      }
      if (key.includes("question_15_base")) {
        if (["Together with my child, and clearly explained"].includes(value))
          parentType.Authoritative++;
        else if (value === "I make the rules and expect them to follow")
          parentType.Authoritarian++;
        else if (value === "I prefer to be flexible") parentType.Permissive++;
        else if (value === " I don’t really enforce rules")
          parentType.Uninvolved++;
      }
      if (key.includes("question_16_base")) {
        if (["I stay present and help them express it"].includes(value))
          parentType.Authoritative++;
        else if (value === " I tell them to calm down or stop")
          parentType.Authoritarian++;
        else if (value === " I try to distract or joke")
          parentType.Permissive++;
        else if (value === "I avoid dealing with it") parentType.Uninvolved++;
      }
      if (key.includes("question_17_base")) {
        if (["Acknowledge it warmly and ask how they feel"].includes(value))
          parentType.Authoritative++;
        else if (value === "Say ‘good job’ and move on")
          parentType.Authoritarian++;
        else if (value === "Let them enjoy without comment")
          parentType.Permissive++;
        else if (value === "Miss the moment entirely") parentType.Uninvolved++;
      }
      if (key.includes("question_18_base")) {
        if (["Regularly and openly"].includes(value))
          parentType.Authoritative++;
        else if (value === "Only when there’s a problem")
          parentType.Authoritarian++;
        else if (value === "Rarely ") parentType.Permissive++;
        else if (value === " I avoid emotional conversations")
          parentType.Uninvolved++;
      }
      if (key.includes("question_19_base")) {
        if (["Reinforce the boundary and talk about why"].includes(value))
          parentType.Authoritative++;
        else if (value === "Impose a consequence immediately")
          parentType.Authoritarian++;
        else if (value === "Let it slide ") parentType.Permissive++;
        else if (value === "Say nothing and hope it fixes itself")
          parentType.Uninvolved++;
      }
      if (key.includes("question_20_base")) {
        if (["More understanding"].includes(value)) parentType.Authoritative++;
        else if (value === " Less stress") parentType.Authoritarian++;
        else if (value === "More respect  ") parentType.Permissive++;
        else if (value === "Distant or unclear") parentType.Uninvolved++;
      }

      if (key.includes("question_22_base")) {
        if (
          ["Lay down consequences so they learn responsibility"].includes(value)
        )
          transactionalAnalysis.cpPositive++;
        else if (value === "  Get visibly upset because it keeps happening")
          transactionalAnalysis.cpNegative++;
        else if (value === "Try to understand what led them to break the rule")
          transactionalAnalysis.npPositive++;
        else if (value === "Offer reassurance and then explain gently")
          transactionalAnalysis.npNegative++;
      }
      if (key.includes("question_23_base")) {
        if (["I set a clear boundary with firmness"].includes(value))
          transactionalAnalysis.cpPositive++;
        else if (value === " I raise my voice or express irritation")
          transactionalAnalysis.cpNegative++;
        else if (
          value === " I offer help and try to connect with how they feel"
        )
          transactionalAnalysis.npPositive++;
        else if (value === " I let it go for now — they’ll come around")
          transactionalAnalysis.npNegative++;
      }
      if (key.includes("question_24_base")) {
        if (
          ["Calm, firm, and consistent — it’s about structure"].includes(value)
        )
          transactionalAnalysis.cpPositive++;
        else if (value === "  Strict and intense — so they know I’m serious")
          transactionalAnalysis.cpNegative++;
        else if (value === "Kind but honest — I explain how it affects others")
          transactionalAnalysis.npPositive++;
        else if (
          value === " Gentle and accommodating — I don’t want to upset them"
        )
          transactionalAnalysis.npNegative++;
      }
      if (key.includes("question_25_base")) {
        if (["Help them refocus and move on with the task"].includes(value))
          transactionalAnalysis.cpPositive++;
        else if (value === "Tell them to toughen up or stop overreacting")
          transactionalAnalysis.cpNegative++;
        else if (
          value === "Validate their feelings and support them through it"
        )
          transactionalAnalysis.npPositive++;
        else if (
          value === "Try to distract them or soothe without talking too much"
        )
          transactionalAnalysis.npNegative++;
      }
      if (key.includes("question_26_base")) {
        if (["I hold my ground calmly and reassert the rule"].includes(value))
          transactionalAnalysisChild.acPositive++;
        else if (value === " I feel disrespected and respond strongly")
          transactionalAnalysisChild.acNegative++;
        else if (
          value === " I welcome the conversation and explain my reasoning"
        )
          transactionalAnalysisChild.fcPositive++;
        else if (value === " I try to avoid conflict or let it slide")
          transactionalAnalysisChild.fcNegative++;
      }
      if (key.includes("question_27_base")) {
        if ([" I expressed myself only when it felt safe"].includes(value))
          transactionalAnalysisChild.acPositive++;
        else if (
          value === " I rarely had the space or freedom to express creatively"
        )
          transactionalAnalysisChild.acNegative++;
        else if (
          value === "I was imaginative and playful, and encouraged often"
        )
          transactionalAnalysisChild.fcPositive++;
        else if (value === "I was told I was being silly or dramatic")
          transactionalAnalysisChild.fcNegative++;
      }
      if (key.includes("question_28_base")) {
        if (
          [
            "They listened and helped me understand and regulate my feelings",
          ].includes(value)
        )
          transactionalAnalysisChild.acPositive++;
        else if (
          value === "They told me to be strong or stop crying immediately"
        )
          transactionalAnalysisChild.acNegative++;
        else if (
          value ===
          "They listened and let me express myself freely, even if it got messy"
        )
          transactionalAnalysisChild.fcPositive++;
        else if (
          value === " They told me I was being too sensitive or dramatic"
        )
          transactionalAnalysisChild.fcNegative++;
      }
      if (key.includes("question_29_base")) {
        if (["Sometimes — depending on the mood at home"].includes(value))
          transactionalAnalysisChild.acPositive++;
        else if (value === "Rarely — I had to manage on my own")
          transactionalAnalysisChild.acNegative++;
        else if (value === " Often — I could be myself and felt safe sharing")
          transactionalAnalysisChild.fcPositive++;
        else if (value === " Never — it felt unsafe or pointless to share")
          transactionalAnalysisChild.fcNegative++;
      }
      if (key.includes("question_30_base")) {
        if (
          ["I was encouraged to follow rules and express myself"].includes(
            value
          )
        )
          transactionalAnalysisChild.acPositive++;
        else if (value === " I learned to stay quiet and not make trouble ")
          transactionalAnalysisChild.acNegative++;
        else if (
          value ===
          " I was free to be playful, messy, and still felt deeply loved"
        )
          transactionalAnalysisChild.fcPositive++;
        else if (value === "I felt pressure to be perfect or make others happy")
          transactionalAnalysisChild.fcNegative++;
      }
      if (key.includes("question_31_base")) {
        if (["Let me make mistakes without fear of punishment"].includes(value))
          transactionalAnalysisChild.acPositive++;
        else if (
          value ===
          " Understood and supported my emotions instead of ignoring them"
        )
          transactionalAnalysisChild.acNegative++;
        else if (
          value ===
          " Given me more freedom to play, explore, and express myself"
        )
          transactionalAnalysisChild.fcPositive++;
        else if (
          value === "Allowed me to be less perfect and more emotionally open"
        )
          transactionalAnalysisChild.fcNegative++;
      }
      if (key.includes("question_32_base")) {
        const ideal = "I feel calm and try to support them";
        const needName = "Need for Emotional Expression";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_33_base")) {
        const ideal = "Help them learn without shame";
        const needName = "Need for Acceptance";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_34_base")) {
        const ideal = "Delighted and join in";
        const needName = "Need for Freedom to Play";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_35_base")) {
        const ideal = "Explain the reasoning";
        const needName = "Need for Autonomy";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_36_base")) {
        const ideal = "Warm and present";
        const needName = "Need for Being Seen";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_37_base")) {
        const ideal = "Curious";
        const needName = "Need for Voice";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_38_base")) {
        const ideal = "Encourage gently";
        const needName = "Need for Patience and Growth";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_39_base")) {
        const ideal = "Offer comfort and listen";
        const needName = "Need for Safety";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_40_base")) {
        const ideal = "Proud and supportive";
        const needName = "Need for Trust";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      if (key.includes("question_41_base")) {
        const ideal = "Support them anyway";
        const needName = "Need for Unconditional Love";
        unmetNeedsResults[needName] = value === ideal ? "met" : "unmet";
      }

      // Attachment Theory logic
      if (key.includes("question_42_base")) {
        if (value === "Hold them") attachmentStyles.Secure++;
        else if (["Offer advice", "Distract them"].includes(value))
          attachmentStyles.Avoidant++;
        else if (value === "Walk away") attachmentStyles.Avoidant++;
        else if (value === "Freeze or feel overwhelmed")
          attachmentStyles.Anxious++;
      }

      if (key.includes("question_43_base")) {
        if (value === "Comfortable and connected") attachmentStyles.Secure++;
        else if (value === "Proud but unsure") attachmentStyles.Anxious++;
        else if (value === "A little suffocated") attachmentStyles.Avoidant++;
        else if (
          value === "Emotionally burdened" ||
          value === "Anxious or confused"
        )
          attachmentStyles.Disorganized++;
      }

      if (key.includes("question_44_base")) {
        if (["What did I do wrong?", "I feel rejected"].includes(value))
          attachmentStyles.Anxious++;
        else if (["I feel relief", "Withdraw emotionally"].includes(value))
          attachmentStyles.Avoidant++;
        else if (
          ["Feel anxious or hurt", "Don’t know how to respond"].includes(value)
        )
          attachmentStyles.Disorganized++;
      }

      if (key.includes("question_45_base")) {
        if (value === "Rarely") attachmentStyles.Secure++;
        else if (["Often", "Constantly"].includes(value))
          attachmentStyles.Anxious++;
      }

      if (key.includes("question_46_base")) {
        if (value === "Talk it out calmly") attachmentStyles.Secure++;
        else if (value === "Raise voice or scold")
          attachmentStyles.Disorganized++;
        else if (value === "Try to fix everything") attachmentStyles.Anxious++;
        else if (["Withdraw", "I shut down emotionally"].includes(value))
          attachmentStyles.Avoidant++;
      }

      if (key.includes("question_47_base")) {
        if (value === "Warm and consistent") attachmentStyles.Secure++;
        else if (value === "Conditional on behavior")
          attachmentStyles.Anxious++;
        else if (value === "Rare or minimal") attachmentStyles.Avoidant++;
        else if (value === "Confusing or unpredictable")
          attachmentStyles.Disorganized++;
      }

      if (key.includes("question_48_base")) {
        if (value === "Instinctively offer hugs or closeness")
          attachmentStyles.Secure++;
        else if (value === "Feel unsure what to do") attachmentStyles.Anxious++;
        else if (
          [
            "Offer logic or advice",
            "Wait for them to ask",
            "Avoid getting too involved",
          ].includes(value)
        )
          attachmentStyles.Avoidant++;
      }

      if (key.includes("question_49_base")) {
        if (value === "Yes, fully") attachmentStyles.Secure++;
        else if (value === "Sometimes") attachmentStyles.Anxious++;
        else if (["Only when I’m in a good mood", "Not really"].includes(value))
          attachmentStyles.Avoidant++;
        else if (value === "I avoid emotional sharing")
          attachmentStyles.Disorganized++;
      }

      if (key.includes("question_50_base")) {
        if (value === "Stay with them calmly") attachmentStyles.Secure++;
        else if (value === "Try to quiet them") attachmentStyles.Avoidant++;
        else if (value === "Feel overwhelmed") attachmentStyles.Anxious++;
        else if (["Leave the room", "Panic or freeze"].includes(value))
          attachmentStyles.Disorganized++;
      }

      if (key.includes("question_51_base")) {
        if (value === "I understand") attachmentStyles.Secure++;
        else if (["I feel hurt", "I get insecure"].includes(value))
          attachmentStyles.Anxious++;
        else if (value === "I try harder") attachmentStyles.Disorganized++;
        else if (value === "I act indifferent but feel bad")
          attachmentStyles.Avoidant++;
      }

      if (key.includes("question_52_base")) {
        if (value === "I listen and help them express themselves clearly")
          familySystemTheory.healthyBoundaries++;
        else if (
          value === "I get upset and feel disrespected" ||
          value === "I try to convince them to think like me"
        )
          familySystemTheory.enmeshedBoundaries++;
        else familySystemTheory.disengagedBoundaries++;
      }

      if (key.includes("question_53_base")) {
        if (value === "I support them but stay involved")
          familySystemTheory.healthyBoundaries++;
        else if (
          value === "I feel anxious and try to stay close" ||
          value === "I give them freedom but feel nervous"
        )
          familySystemTheory.enmeshedBoundaries++;
        else familySystemTheory.disengagedBoundaries++;
      }

      if (key.includes("question_54_base")) {
        if (value === "I respect their privacy with support")
          familySystemTheory.healthyBoundaries++;
        else if (
          value === "I insist they tell me everything" ||
          value === "I feel shut out or offended"
        )
          familySystemTheory.enmeshedBoundaries++;
        else familySystemTheory.disengagedBoundaries++;
      }

      if (key.includes("question_55_base")) {
        if (value === "My own parenting voice")
          familyLegacyThemes.Reparenting++;
        else if (value === "My parents or elders")
          familyLegacyThemes["Repeating Pattern"]++;
        else if (value === "I go blank and react instinctively")
          familyLegacyThemes.Overcorrecting++;
      }

      // Question 56
      if (key.includes("question_56_base")) {
        if (value === "I listen and validate their feelings")
          familyLegacyThemes.Reparenting++;
        else if (
          value === "I tell them to stop crying" ||
          value === "I freeze and don’t know what to do"
        )
          familyLegacyThemes["Repeating Pattern"]++;
        else familyLegacyThemes.Overcorrecting++;
      }

      // Question 57
      if (key.includes("question_57_base")) {
        if (value === "Doing things differently but still feel unsure")
          familyLegacyThemes.Reparenting++;
        else if (value === "Becoming like my parents")
          familyLegacyThemes["Repeating Pattern"]++;
        else if (value === "Not knowing what I’m doing")
          familyLegacyThemes.Overcorrecting++;
      }

      if (key.includes("question_58_base")) {
        if (value.includes("Responsible"))
          familySystemTheoryGrowing.caregiver++;
        else if (value.includes("Peacemaker"))
          familySystemTheoryGrowing.peacemaker++;
        else if (value.includes("Rule-breaker"))
          familySystemTheoryGrowing.rebel++;
        else if (value.includes("Quiet")) familySystemTheoryGrowing.invisible++;
      }

      // Question 59
      if (key.includes("question_59_base")) {
        if (value.includes("Fix it")) familySystemTheoryGrowing.caregiver++;
        else if (value.includes("Keep calm"))
          familySystemTheoryGrowing.peacemaker++;
        else if (value.includes("Express frustration"))
          familySystemTheoryGrowing.rebel++;
        else if (value.includes("Withdraw"))
          familySystemTheoryGrowing.invisible++;
      }
    }

    const mbti =
      (dimensions.I >= dimensions.E ? "I" : "E") +
      (dimensions.S >= dimensions.N ? "S" : "N") +
      (dimensions.T >= dimensions.F ? "T" : "F") +
      (dimensions.J >= dimensions.P ? "J" : "P");

    const dominantStyle = Object.entries(parentType).reduce((a, b) =>
      a[1] >= b[1] ? a : b
    )[0];

    // 👇 Reduce to find the dominant TA state
    const dominantTA = Object.entries(transactionalAnalysis).reduce((a, b) =>
      a[1] >= b[1] ? a : b
    )[0];

    // 🔁 Reduce to find dominant Child ego state
    const dominantTAChild = Object.entries(transactionalAnalysisChild).reduce(
      (a, b) => (a[1] >= b[1] ? a : b)
    )[0];

    const dominantAttachment = Object.entries(attachmentStyles).reduce((a, b) =>
      a[1] >= b[1] ? a : b
    )[0];

    const dominantFamilySystem = Object.entries(familySystemTheory).reduce(
      (a, b) => (a[1] >= b[1] ? a : b)
    )[0];

    const dominantFamilyLegacyTheme = Object.entries(familyLegacyThemes).reduce(
      (a, b) => (a[1] >= b[1] ? a : b)
    )[0];

    const dominantGrowingRole = Object.entries(
      familySystemTheoryGrowing
    ).reduce((a, b) => (a[1] >= b[1] ? a : b))[0];

    return {
      mbti,
      parentType,
      dominantStyle,
      transactionalAnalysis,
      dominantTA,
      transactionalAnalysisChild,
      dominantTAChild,
      unmetNeedsResults,
      attachmentStyles,
      dominantAttachment,
      familySystemTheory,
      dominantFamilySystem,
      familyLegacyThemes,
      dominantFamilyLegacyTheme,
      familySystemTheoryGrowing,
      dominantGrowingRole,
    };
  };

  const handleBaseAnswer = async (answer) => {
    const responseKey = `question_${currentQuestion.id}_base`;
    const newResponses = {
      ...responses,
      [responseKey]: answer,
    };
    setResponses(newResponses);

    // Save base answer to database
    await saveToDatabase({
      userId: userId || "anonymous",
      questionId: currentQuestion.id,
      questionType: "base",
      answer: answer,
      timestamp: new Date().toISOString(),
    });

    // Check if this answer triggers a follow-up
    if (currentQuestion.followUpTrigger.includes(answer)) {
      setShowFollowUp(true);
      setCurrentFollowUp(currentQuestion);
    } else {
      // Move to next question
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setShowFollowUp(false);
        setCurrentFollowUp(null);
      } else {
        const mbtiResult = calculateMbtiFromResponses(responses);
        await saveMbtiResult(mbtiResult); // ✅ Save to DB
        setIsComplete(true);
      }
    }
  };

  const handleFollowUpAnswer = async (answer) => {
    const responseKey = `question_${currentQuestion.id}_followup`;
    const newResponses = {
      ...responses,
      [responseKey]: answer,
    };
    setResponses(newResponses);

    // Save follow-up answer to database
    await saveToDatabase({
      userId: userId || "anonymous",
      questionId: currentQuestion.id,
      questionType: "followup",
      answer: answer,
      timestamp: new Date().toISOString(),
    });

    setShowFollowUp(false);
    setCurrentFollowUp(null);

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // 🧠 Here calculate MBTI result from responses
      const mbtiResult = calculateMbtiFromResponses(responses); // You'll write this function
      await saveMbtiResult(mbtiResult); // ✅ Save to DB
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (showFollowUp) {
      setShowFollowUp(false);
      setCurrentFollowUp(null);
    } else if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      // Check if previous question had a follow-up
      const prevQuestion = questions[currentQuestionIndex - 1];
      const prevBaseAnswer = responses[`question_${prevQuestion.id}_base`];
      if (
        prevBaseAnswer &&
        prevQuestion.followUpTrigger.includes(prevBaseAnswer)
      ) {
        setShowFollowUp(true);
        setCurrentFollowUp(prevQuestion);
      }
    }
  };

  const resetQuestionnaire = () => {
    setCurrentQuestionIndex(0);
    setResponses({});
    setShowFollowUp(false);
    setCurrentFollowUp(null);
    setIsComplete(false);
  };

  const exportResponses = () => {
    const dataStr = JSON.stringify(responses, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `mbti_responses_${
      new Date().toISOString().split("T")[0]
    }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Questionnaire Complete!
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for completing the MBTI Parenting Style Assessment. Your
              responses have been saved successfully.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                Total Questions Answered: {Object.keys(responses).length}
              </p>
              <p className="text-sm text-gray-700">
                User ID: {userId || "Anonymous"}
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetQuestionnaire}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start Over
              </button>
              <button
                onClick={exportResponses}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Export Responses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                MBTI Parenting Assessment
              </h1>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Enter User ID (optional)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                {getCategoryIcon(currentQuestion.category)}
                <span className="text-sm font-medium">
                  {currentQuestion.category}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {questions.length}
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / questions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {!showFollowUp ? (
            /* Base Question */
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.baseQuestion}
              </h2>
              <div className="space-y-3">
                {currentQuestion.baseOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleBaseAnswer(option)}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-blue-700">
                        {option}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Follow-up Question */
            <div>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">
                  Follow-up Question
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Based on your previous answer: "
                  {responses[`question_${currentQuestion.id}_base`]}"
                </p>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentFollowUp.followUpQuestion}
              </h2>
              <div className="space-y-3">
                {currentFollowUp.followUpOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleFollowUpAnswer(option)}
                    className="w-full p-4 text-left border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 group-hover:text-blue-700">
                        {option}
                      </span>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0 && !showFollowUp}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="text-sm text-gray-500">
              {showFollowUp
                ? "Follow-up"
                : `${currentQuestionIndex + 1}/${questions.length}`}
            </div>
          </div>

          {/* MBTI Impact Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600">
              <span className="font-medium">MBTI Impact:</span>{" "}
              {currentQuestion.mbtiImpact}
            </p>
          </div>
        </div>

        {/* Response Summary */}
        {Object.keys(responses).length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Your Responses</h3>
            <div className="grid gap-2 max-h-32 overflow-y-auto">
              {Object.entries(responses).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate">
                    {key.includes("_base") ? "Base" : "Follow-up"} Q
                    {key.match(/\d+/)[0]}:
                  </span>
                  <span className="text-gray-900 font-medium truncate ml-2">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MBTIQuestionnaire;
