import axios from 'axios';
import { LinkStatisticsData } from '../models';

const projectId = process.env.REACT_APP_PROJECT_ID;

const OUTCOME_URL = `/api/v1/outcome`;
const ADMIN_URL = `/api/v1/admin`;
const TEST_URL = `https://europe-west3-${projectId}.cloudfunctions.net/send_test`;
const TEMPLATE_URL = `https://europe-west3-${projectId}.cloudfunctions.net/mail_template_content`;
const SMS_URL =
  projectId === 'innbyggerkontakt'
    ? 'https://send-test-sms-552f5h6x4a-ey.a.run.app' // Prod URL
    : 'https://send-test-sms-h4kdigdu2q-ey.a.run.app'; // Dev URL

const getAccessToken = () => {
  const user = sessionStorage.getItem('user');
  if (user) {
    return JSON.parse(user).stsTokenManager.accessToken;
  }
};

export const formatDateyyyymmdd = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

export interface UserData {
  localId: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  lastLoginAt: string;
}

export interface UserDataListWrapper {
  users: UserData[];
}

export const deleteUser = async (userId: string) => {
  const response = await axios.delete(`${ADMIN_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const getUsers = async () => {
  const response = await axios.get<UserDataListWrapper>(`${ADMIN_URL}/users`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const getUser = async (userId: string) => {
  const response = await axios.get<UserData>(`${ADMIN_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const GetCampaignStatisticsForOrganization = async (signal: AbortSignal) => {
  const response = await axios
    .get(`${OUTCOME_URL}/mailjet/stats/`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
      signal: signal,
    })
    .catch((error) => {
      if (!signal.aborted) {
        console.error(`Error: ${error}`);
      }
    });

  return response ? response.data : undefined;
};

export const getCampaignStatisticForBulletin = async (bulletinId: string) => {
  const response = await axios.get(`${OUTCOME_URL}/mailjet/stats/${bulletinId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const getCampaignStatisticOverTimePerDay = async (bulletinId: string, fromData: Date, toDate: Date) => {
  const response = await axios.get(
    `${OUTCOME_URL}/mailjet/stats/interval/day/${bulletinId}/${formatDateyyyymmdd(fromData)}/${formatDateyyyymmdd(
      toDate,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    },
  );
  return response.data;
};

export const getCampaignStatisticOverTimePerDayForKey = async (fromData: Date, toDate: Date) => {
  const response = await axios.get(
    `${OUTCOME_URL}/mailjet/stats/interval/total/day/${formatDateyyyymmdd(fromData)}/${formatDateyyyymmdd(toDate)}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    },
  );
  return response.data;
};

export const getLifetimeCampaignStatisticOverTimePerDayForKey = async () => {
  const response = await axios.get(`${OUTCOME_URL}/mailjet/stats/lifetime/`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const getCampaignStatisticOverTimePerHour = async (bulletinId: string, fromData: Date, toDate: Date) => {
  const response = await axios.get(
    `${OUTCOME_URL}/mailjet/stats/interval/hour/${bulletinId}/${fromData.toISOString()}/${toDate.toISOString()}`,
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    },
  );
  return response.data;
};

export const getLinkStatistics = async (bulletinId: string) => {
  const response = await axios.get(`${OUTCOME_URL}/mailjet/linkstatistics/${bulletinId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data as LinkStatisticsData[];
};

export const getStatistics = async (bulletinId: string) => {
  const response = await axios.get(`${OUTCOME_URL}/bulletin/${bulletinId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const getStatisticsCollection = async () => {
  const response = await axios.get(`${OUTCOME_URL}/bulletin/list`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return response.data;
};

export const sendTestEmailsToUsers = async (emails: string[], bulletinId: string) => {
  await axios.post(
    `${TEST_URL}/${bulletinId}`,
    {
      email_adresses: emails,
    },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    },
  );
};

export const getTemplateContent = async (templateId: string) => {
  const response = await axios.get(`${TEMPLATE_URL}?templateId=${templateId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  return response;
};

export const sendTestSmsToUsers = async (phoneNumbers: string[], message: string) => {
  await axios.post(
    `${SMS_URL}`,
    {
      to: phoneNumbers,
      message: message,
    },
    {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    },
  );
};
