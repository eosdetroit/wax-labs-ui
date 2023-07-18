import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaTelegramPlane } from 'react-icons/fa';
import { MdLink, MdOutlineGroups, MdOutlineLanguage, MdPerson } from 'react-icons/md';
import { useParams } from 'react-router-dom';

import { Link } from '@/components/Link';
import { useChain } from '@/hooks/useChain.ts';
import { imageExists } from '@/utils/image';

interface ProfileCardProps {
  imageUrl: string;
  fullName: string;
  biography: string;
  groupName: string;
  country: string;
  website: string;
  telegram: string;
}

export function ProfileCard({
  imageUrl,
  fullName,
  biography,
  groupName,
  country,
  website,
  telegram,
}: ProfileCardProps) {
  const { t } = useTranslation();
  const { actor } = useChain();
  const { actor: actorParam } = useParams();

  const [avatar, setAvatar] = useState(<MdPerson className="text-low-contrast" size={28} />);

  useEffect(() => {
    imageExists(imageUrl)
      .then(() => setAvatar(<img className="h-full w-full rounded-full object-cover" src={imageUrl} />))
      .catch(() => setAvatar(<MdPerson className="text-low-contrast" size={28} />));
  }, [imageUrl]);

  return (
    <div className="flex w-full flex-col gap-8 overflow-hidden rounded-xl bg-subtle p-8">
      <div className="flex w-full items-center gap-4">
        <div className="flex h-14 min-h-[56px] w-14 min-w-[56px] items-center justify-center rounded-full border-2">
          {avatar}
        </div>
        <div className="w-full flex-col gap-1">
          <h3 className="title-3 text-high-contrast">{fullName ?? actorParam}</h3>
          <p className="body-2 text-high-contrast">{actorParam}</p>
        </div>
        {actor == actorParam && (
          <div className="flex min-w-[140px] justify-end">
            <Link to={'/' + actor + '/edit'} variant="secondary">
              {t('editProfile')}
            </Link>
          </div>
        )}
      </div>
      <div className="flex-1 p-4">
        <p className="label-2 text-high-contrast">{t('biography')}</p>
        <p className="body-1 text-low-contrast">{biography}</p>
      </div>
      <div className="label-1 mx-4 flex-1 divide-y divide-subtle-light text-low-contrast">
        <div className="flex gap-4 py-4">
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="flex-none">
              <MdOutlineGroups size={24} />
            </div>
            <p className="label-2 flex-1 truncate text-high-contrast">{t('groupName')}</p>
          </div>
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <p className="label-1 flex-1 truncate text-end text-high-contrast">{groupName}</p>
          </div>
        </div>
        <div className="flex gap-4 py-4">
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="flex-none">
              <MdOutlineLanguage size={24} />
            </div>
            <p className="label-2 flex-1 truncate text-high-contrast">{t('country')}</p>
          </div>
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <p className="label-1 flex-1 truncate text-end text-high-contrast">{country}</p>
          </div>
        </div>
        <div className="flex gap-4 py-4">
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="flex-none">
              <MdLink size={24} />
            </div>
            <p className="label-2 flex-1 truncate text-high-contrast">{t('website')}</p>
          </div>
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <p className="label-1 flex-1 truncate text-end text-high-contrast">{website}</p>
          </div>
        </div>
        <div className="flex gap-4 py-4">
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <div className="flex-none">
              <FaTelegramPlane size={24} />
            </div>
            <p className="label-2 flex-1 truncate text-high-contrast">{t('telegram')}</p>
          </div>
          <div className="flex flex-1 items-center gap-4 overflow-hidden whitespace-nowrap">
            <p className="label-1 flex-1 truncate text-end text-high-contrast">{telegram}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
