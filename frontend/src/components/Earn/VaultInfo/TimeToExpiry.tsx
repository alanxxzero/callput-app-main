import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import duration from 'dayjs/plugin/duration';
import { useSubscription } from 'observable-hooks';

import React, { useState } from 'react'
import { interval, startWith } from 'rxjs';
import { twMerge, twJoin } from 'tailwind-merge'

dayjs.extend(utc)
dayjs.extend(duration)

function getTimeUntilNextUTC8() {
  const now = dayjs().utc();
  let target = dayjs().utc().hour(8).minute(0).second(0).millisecond(0);

  if (now.hour() >= 8) {
    target = target.add(1, 'day');
  }

  return target.diff(now);
}

const interval$ = interval(1000).pipe(startWith(0));

const TimeToExpiry = () => {
  const [diff, setDiff] = useState("")

  useSubscription(interval$, () => {
    const diff = getTimeUntilNextUTC8()
    const duration = dayjs.duration(diff);

    const hours = String(Math.floor(duration.asHours())).padStart(2, '0');
    const minutes = String(duration.minutes()).padStart(2, '0');
    const seconds = String(duration.seconds()).padStart(2, '0');

    const formattedDiff = `${hours}:${minutes}:${seconds}`

    setDiff(formattedDiff)
  })


  return (
    <div className="">
      {diff}
    </div>
  )
}

export default TimeToExpiry