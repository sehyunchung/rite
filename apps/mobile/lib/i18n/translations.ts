/**
 * Translation definitions for mobile app
 * Simplified version of next-app messages for cross-platform use
 */
import type { SupportedLocale } from './index';

// Translation schema type definition  
export interface TranslationSchema extends Record<string, unknown> {
  common: {
    loading: string;
    error: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    copy: string;
    copied: string;
    back: string;
    submit: string;
    close: string;
  };
  navigation: {
    dashboard: string;
    events: string;
    createEvent: string;
    profile: string;
    signOut: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    welcome: string;
    createNewEvent: string;
    noEvents: string;
    noEventsDescription: string;
    yourEvents: string;
    actions: {
      createEvent: string;
      createEventDescription: string;
      viewEvents: string;
      viewEventsDescription: string;
      profile: string;
      profileDescription: string;
    };
  };
  events: {
    create: {
      title: string;
      eventName: string;
      eventNamePlaceholder: string;
      date: string;
      venueName: string;
      venueNamePlaceholder: string;
      venueAddress: string;
      venueAddressPlaceholder: string;
      description: string;
      descriptionPlaceholder: string;
      hashtags: string;
      hashtagsPlaceholder: string;
      djLineup: string;
      addSlot: string;
      startTime: string;
      endTime: string;
      djName: string;
      djNamePlaceholder: string;
      instagramHandle: string;
      instagramPlaceholder: string;
      createEvent: string;
      creating: string;
      slot: string;
      success: string;
      error: string;
    };
    detail: {
      backToDashboard: string;
      edit: string;
      submissions: string;
      djLineup: string;
      noDJsScheduled: string;
    };
    list: {
      title: string;
      noEvents: string;
      viewDetails: string;
    };
  };
  validation: {
    required: string;
    eventNameRequired: string;
    venueNameRequired: string;
    venueAddressRequired: string;
    pastDate: string;
    djSlotsRequired: string;
    timeRequired: string;
    instagramRequired: string;
  };
  auth: {
    signIn: string;
    signOut: string;
    continueWithGoogle: string;
    continueWithApple: string;
    continueWithInstagram: string;
    loginRequired: string;
  };
  status: {
    active: string;
    inactive: string;
    draft: string;
    completed: string;
    published: string;
  };
}

// Core translations needed for mobile app
export const translations: Record<SupportedLocale, TranslationSchema> = {
  en: {
    common: {
      loading: 'Loading...',
      error: 'Error',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      copy: 'Copy',
      copied: 'Copied!',
      back: 'Back',
      submit: 'Submit',
      close: 'Close'
    },
    navigation: {
      dashboard: 'Dashboard',
      events: 'Events',
      createEvent: 'Create Event',
      profile: 'Profile',
      signOut: 'Sign Out'
    },
    dashboard: {
      title: 'RITE',
      subtitle: 'DJ Event Management',
      welcome: 'Welcome back!',
      createNewEvent: 'Create New Event',
      noEvents: 'No events yet',
      noEventsDescription: 'Create your first event to get started',
      yourEvents: 'Your Events',
      actions: {
        createEvent: 'Create Event',
        createEventDescription: 'Set up a new DJ event',
        viewEvents: 'View Events',
        viewEventsDescription: 'Manage your events',
        profile: 'Profile',
        profileDescription: 'Manage your profile'
      }
    },
    events: {
      create: {
        title: 'Create Event',
        eventName: 'Event Name',
        eventNamePlaceholder: 'Enter event name',
        date: 'Date',
        venueName: 'Venue Name',
        venueNamePlaceholder: 'Enter venue name',
        venueAddress: 'Venue Address',
        venueAddressPlaceholder: 'Enter venue address',
        description: 'Description (optional)',
        descriptionPlaceholder: 'Event description',
        hashtags: 'Hashtags (optional)',
        hashtagsPlaceholder: '#rave #techno #seoul',
        djLineup: 'DJ Lineup',
        addSlot: 'Add Slot',
        startTime: 'Start Time',
        endTime: 'End Time',
        djName: 'DJ Name (optional)',
        djNamePlaceholder: 'DJ Name',
        instagramHandle: 'Instagram Handle *',
        instagramPlaceholder: '@username',
        createEvent: 'Create Event',
        creating: 'Creating...',
        slot: 'Slot {number}',
        success: 'Event created successfully!',
        error: 'Failed to create event. Please try again.'
      },
      detail: {
        backToDashboard: 'Back to Dashboard',
        edit: 'Edit',
        submissions: 'Submissions',
        djLineup: 'DJ Lineup ({count})',
        noDJsScheduled: 'No DJs scheduled yet.'
      },
      list: {
        title: 'Events',
        noEvents: 'No events found',
        viewDetails: 'View Details'
      }
    },
    validation: {
      required: 'This field is required',
      eventNameRequired: 'Please enter an event name',
      venueNameRequired: 'Please enter a venue name',
      venueAddressRequired: 'Please enter a venue address',
      pastDate: 'Event date cannot be in the past',
      djSlotsRequired: 'At least one DJ slot is required',
      timeRequired: 'All DJ slots must have start and end times',
      instagramRequired: 'All DJ slots must have an Instagram handle'
    },
    auth: {
      signIn: 'Sign In',
      signOut: 'Sign Out',
      continueWithGoogle: 'Continue with Google',
      continueWithApple: 'Continue with Apple',
      continueWithInstagram: 'Continue with Instagram',
      loginRequired: 'You must be logged in to create an event'
    },
    status: {
      active: 'Active',
      inactive: 'Inactive',
      draft: 'Draft',
      completed: 'Completed',
      published: 'Published'
    }
  },
  ko: {
    common: {
      loading: '로딩 중...',
      error: '오류',
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      create: '만들기',
      copy: '복사',
      copied: '복사됨!',
      back: '뒤로',
      submit: '제출',
      close: '닫기'
    },
    navigation: {
      dashboard: '대시보드',
      events: '이벤트',
      createEvent: '이벤트 만들기',
      profile: '프로필',
      signOut: '로그아웃'
    },
    dashboard: {
      title: 'RITE',
      subtitle: 'DJ 이벤트 관리',
      welcome: '환영합니다!',
      createNewEvent: '새 이벤트 만들기',
      noEvents: '아직 이벤트가 없습니다',
      noEventsDescription: '첫 번째 이벤트를 만들어보세요',
      yourEvents: '내 이벤트',
      actions: {
        createEvent: '이벤트 만들기',
        createEventDescription: '새로운 DJ 이벤트 설정',
        viewEvents: '이벤트 보기',
        viewEventsDescription: '이벤트 관리',
        profile: '프로필',
        profileDescription: '프로필 관리'
      }
    },
    events: {
      create: {
        title: '이벤트 만들기',
        eventName: '이벤트 이름',
        eventNamePlaceholder: '이벤트 이름을 입력하세요',
        date: '날짜',
        venueName: '장소 이름',
        venueNamePlaceholder: '장소 이름을 입력하세요',
        venueAddress: '장소 주소',
        venueAddressPlaceholder: '장소 주소를 입력하세요',
        description: '설명 (선택사항)',
        descriptionPlaceholder: '이벤트 설명',
        hashtags: '해시태그 (선택사항)',
        hashtagsPlaceholder: '#레이브 #테크노 #서울',
        djLineup: 'DJ 라인업',
        addSlot: '슬롯 추가',
        startTime: '시작 시간',
        endTime: '종료 시간',
        djName: 'DJ 이름 (선택사항)',
        djNamePlaceholder: 'DJ 이름',
        instagramHandle: '인스타그램 핸들 *',
        instagramPlaceholder: '@사용자이름',
        createEvent: '이벤트 만들기',
        creating: '만드는 중...',
        slot: '슬롯 {number}',
        success: '이벤트가 성공적으로 만들어졌습니다!',
        error: '이벤트 만들기에 실패했습니다. 다시 시도해주세요.'
      },
      detail: {
        backToDashboard: '대시보드로 돌아가기',
        edit: '편집',
        submissions: '제출물',
        djLineup: 'DJ 라인업 ({count}명)',
        noDJsScheduled: '아직 예정된 DJ가 없습니다.'
      },
      list: {
        title: '이벤트',
        noEvents: '이벤트를 찾을 수 없습니다',
        viewDetails: '자세히 보기'
      }
    },
    validation: {
      required: '이 필드는 필수입니다',
      eventNameRequired: '이벤트 이름을 입력해주세요',
      venueNameRequired: '장소 이름을 입력해주세요',
      venueAddressRequired: '장소 주소를 입력해주세요',
      pastDate: '이벤트 날짜는 과거일 수 없습니다',
      djSlotsRequired: '최소 하나의 DJ 슬롯이 필요합니다',
      timeRequired: '모든 DJ 슬롯은 시작 시간과 종료 시간이 있어야 합니다',
      instagramRequired: '모든 DJ 슬롯은 인스타그램 핸들이 있어야 합니다'
    },
    auth: {
      signIn: '로그인',
      signOut: '로그아웃',
      continueWithGoogle: 'Google로 계속',
      continueWithApple: 'Apple로 계속',
      continueWithInstagram: 'Instagram으로 계속',
      loginRequired: '이벤트를 만들려면 로그인해야 합니다'
    },
    status: {
      active: '활성',
      inactive: '비활성',
      draft: '초안',
      completed: '완료',
      published: '게시됨'
    }
  }
};

/**
 * Get translations for a specific locale
 */
export function getTranslations(locale: SupportedLocale) {
  return translations[locale] || translations.en;
}