import {type Schedule} from '@typings';
import {type Gaxios} from 'gaxios';

export const $scheduleMethod = async (
	$client: Gaxios,
): Promise<Schedule[]> => {
    const response = await $client.request({
        url: '/jadwal-rilis',
    });

    
};
