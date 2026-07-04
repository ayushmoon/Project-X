export interface PhotoItem {
  id: string;
  url: string;
  filename: string;
  title: string;
  category: 'Cute' | 'Smiling' | 'Traditional' | 'Selfies' | 'Favorite' | 'Random';
  description: string;
  date?: string;
  isFallback?: boolean;
}

const PHOTO_CATEGORIES_MAP: Record<string, { title: string; categories: PhotoItem['category'][]; description: string; date: string }> = {
  'smiling_blue_shirt.jpg': {
    title: 'Your Radiant Smile',
    categories: ['Smiling', 'Cute', 'Favorite'],
    description: 'Looking straight into my eyes with that sweet, stunning smile. A picture that melts my heart every single time. ❤️',
    date: 'Summer Afternoon'
  },
  'smiling_flower_hair.jpg': {
    title: 'Ethereal Flower Girl',
    categories: ['Smiling', 'Traditional', 'Favorite'],
    description: 'A delicate flower placed gently in your hair as you tilt your head. You look like a painting, absolutely ethereal. 🌸',
    date: 'Spring Morning'
  },
  'car_glasses_selfie.jpg': {
    title: 'Cute Traveler',
    categories: ['Selfies', 'Cute'],
    description: 'Selfie in the car wearing those round pink glasses. Even in casual travel, you look so sweet and adorable! 🚗✨',
    date: 'Road Trip Day'
  },
  'waist_chain_aesthetic.jpg': {
    title: 'Aesthetic Details',
    categories: ['Random', 'Favorite'],
    description: 'A beautiful candid shot showcasing your style, waist chain details, and elegant posture. Mesmerizing! ✨',
    date: 'Sunset Glow'
  },
  'glasses_pucker_selfie.jpg': {
    title: 'Playful Pucker',
    categories: ['Selfies', 'Cute'],
    description: 'Puckering your lips and winking with those leopard glasses! My absolute favorite playful selfie. So cute! 😜💖',
    date: 'Midnight Fun'
  },
  'eyes_close_up.jpg': {
    title: 'Aesthetic Eyes',
    categories: ['Random', 'Favorite'],
    description: 'A close-up aesthetic shot of your beautiful, deep eyes. There is a whole universe hidden in your gaze. ✨',
    date: 'Dreamy Evening'
  },
  'anime_collage.jpg': {
    title: 'Anime Spark Collage',
    categories: ['Selfies', 'Cute', 'Favorite'],
    description: 'Three lovely panels of you in cute anime avatar filter look! You look like a protagonist from a warm, cozy slice-of-life anime. 💖',
    date: 'Playful Afternoon'
  },
  'braids_school_look.jpg': {
    title: 'Cozy Braids & Uniform',
    categories: ['Traditional', 'Cute', 'Favorite'],
    description: 'Double braids school uniform style! The absolute definition of innocence and pure sweetness. So, so adorable. 🎒🌸',
    date: 'School Days'
  },
  'smiling_warm_gaze.jpg': {
    title: 'Sweet Close Selfie',
    categories: ['Smiling', 'Cute', 'Favorite', 'Selfies'],
    description: 'A close-up selfie that highlights your lovely skin, rosy cheeks, and warm, magnetic eyes. A direct cure for any bad day! 🥰❤️',
    date: 'Sunny Afternoon'
  },
  'looking_back_smile.jpg': {
    title: 'Looking Back Smile',
    categories: ['Smiling', 'Random', 'Favorite'],
    description: 'Looking back over your shoulder with a gorgeous, gentle smile. That long flowing hair and your sweet posture are absolutely magical. ✨🌟',
    date: 'Evening Stroll'
  },
  'bade_log_braids.jpg': {
    title: 'Bade Log Braids',
    categories: ['Traditional', 'Cute'],
    description: "Double braids styling with a playful 'Bade log' (big people) caption look. Overflowing with cuteness and charm! 👧🌸",
    date: 'Cozy Morning'
  },
  'pink_bows_hair.jpg': {
    title: 'Cute Pink Bows',
    categories: ['Selfies', 'Cute', 'Favorite'],
    description: 'A delightful selfie featuring pink bows in your long hair. You look like a real-life princess, so sweet and lovely! 🎀💖',
    date: 'Festive Afternoon'
  },
  'long_hair_blue_shirt.jpg': {
    title: 'Shining Black Locks',
    categories: ['Smiling', 'Selfies', 'Favorite'],
    description: 'Showing off your gorgeous long black hair wearing a comfy navy blue shirt. That gentle look in your eyes is absolutely mesmerizing. 🌟✨',
    date: 'Relaxed Evening'
  },
  'purple_flower_couch.jpg': {
    title: 'Purple Flower Daydream',
    categories: ['Smiling', 'Cute'],
    description: 'Lying down cozily on the couch with a beautiful purple flower tucked behind your ear. Your peaceful smile brings so much warmth. 🌸🛋️',
    date: 'Lazy Sunday'
  },
  'glasses_filter_selfie.jpg': {
    title: 'Playful Glasses Selfie',
    categories: ['Selfies', 'Cute'],
    description: 'Winking with the classic black glasses filter! A playful, silly selfie that never fails to make me smile. So adorable. 🤓💫',
    date: 'Happy Hour'
  },
  'standing_outdoors.jpg': {
    title: 'Casual Outdoors',
    categories: ['Random', 'Cute', 'Favorite', 'Selfies', 'Smiling'],
    description: 'Standing on a leafy stone pathway, looking so gorgeous in a black top and grey sweatpants. A perfect blend of casual and stunning. 🍂🖤',
    date: 'Autumn Morning'
  },
  'brown_shirt_gaze.jpg': {
    title: 'Warm Brown Gazing',
    categories: ['Cute', 'Smiling', 'Favorite'],
    description: 'Looking back over your shoulder in a cozy brown shirt. Those beautiful eyes and lovely pose are absolutely stunning! ❤️',
    date: 'Autumn Evening'
  }
};

export function getLoadedPhotos(): PhotoItem[] {
  try {
    // Dynamically query files inside src/assets/photos at compile/build time
    const photoModules = import.meta.glob(
      '/src/assets/photos/*.{png,jpg,jpeg,webp,gif,PNG,JPG,JPEG,WEBP,GIF}',
      { eager: true }
    );

    const keys = Object.keys(photoModules);
    const validKeys = keys.filter(k => !k.endsWith('.gitkeep'));

    // Fallback logic if folder is somehow empty
    if (validKeys.length === 0) {
      const fallbackList: PhotoItem[] = [];
      Object.entries(PHOTO_CATEGORIES_MAP).forEach(([filename, data]) => {
        data.categories.forEach((cat) => {
          fallbackList.push({
            id: `fb-${filename.split('.')[0]}-${cat.toLowerCase()}`,
            url: 'linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)',
            filename,
            title: data.title,
            category: cat,
            description: data.description,
            date: data.date,
            isFallback: true
          });
        });
      });
      return fallbackList;
    }

    const itemsList: PhotoItem[] = [];

    validKeys.forEach((key) => {
      const filename = key.substring(key.lastIndexOf('/') + 1);
      const url = (photoModules[key] as { default: string }).default;
      const fileWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
      const normalizedBaseKey = fileWithoutExt.toLowerCase();

      const custom = PHOTO_CATEGORIES_MAP[filename];

      if (custom) {
        // Map the photo to multiple categories so it populates all tabs
        custom.categories.forEach((cat) => {
          itemsList.push({
            id: `${normalizedBaseKey}-${cat.toLowerCase()}`,
            url,
            filename,
            title: custom.title,
            category: cat,
            description: custom.description,
            date: custom.date,
          });
        });
      } else {
        // Fallback parser if additional files are added later
        let category: PhotoItem['category'] = 'Random';
        const lowercaseName = fileWithoutExt.toLowerCase();

        if (lowercaseName.includes('cute') || lowercaseName.includes('sweet')) {
          category = 'Cute';
        } else if (lowercaseName.includes('smile') || lowercaseName.includes('smiling')) {
          category = 'Smiling';
        } else if (lowercaseName.includes('traditional') || lowercaseName.includes('ethnic')) {
          category = 'Traditional';
        } else if (lowercaseName.includes('selfie') || lowercaseName.includes('mirror')) {
          category = 'Selfies';
        } else if (lowercaseName.includes('fav') || lowercaseName.includes('favorite')) {
          category = 'Favorite';
        }

        itemsList.push({
          id: normalizedBaseKey,
          url,
          filename,
          title: fileWithoutExt.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          category,
          description: `A lovely memory categorized under ${category}. Tap to read more!`,
          date: 'A Sweet Memory',
        });
      }
    });

    return itemsList;
  } catch (error) {
    console.error('Error scanning photos:', error);
    return [];
  }
}
