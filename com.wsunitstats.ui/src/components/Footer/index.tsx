import { useLocation } from 'react-router-dom';
import * as Constants from '@/utils/constants';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord, faGithub } from '@fortawesome/free-brands-svg-icons';
import './index.css';

const MINIMIZED_PATHS = [
  Constants.MODS_PAGE_PATH
];

export const Footer = () => {
  const { pathname } = useLocation();
  const isFull = !MINIMIZED_PATHS.some(path => pathname.endsWith(path));

  return (
    <>
      <footer>
        {isFull && <>
          <h6>About</h6>
          <p className="text-justify">This is a free and open-source project designed to view War Selection in-game unit stats. Feel free to contact, ask any questions, report issues, make suggestions and contribute</p>
          <hr />
        </>}
        <p className="underline-text">
          Created by: IbubussI, 2023
        </p>
        {isFull && 
        <ul className="social-icons">
          <li><a className="discord" href="https://discord.com/users/536561066407362571"><FontAwesomeIcon icon={faDiscord} widthAuto /></a></li>
          <li><a className="github" href="https://github.com/IbubussI/wsunitstats-static"><FontAwesomeIcon icon={faGithub} widthAuto /></a></li>
        </ul>}
      </footer>
    </>
  )
};