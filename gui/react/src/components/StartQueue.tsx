import { PauseCircleFilled, PlayCircleFilled } from '@mui/icons-material';
import { Button } from '@mui/material';
import React from 'react';
import { messageChannelContext } from '../provider/MessageChannel';
import Require from './Require';

const StartQueueButton: React.FC = () => {
	const messageChannel = React.useContext(messageChannelContext);
	const [start, setStart] = React.useState(false);
	const msg = React.useContext(messageChannelContext);

	React.useEffect(() => {
		(async () => {
			if (!msg) return alert('Estado inválido: canal de mensagem não encontrado');
			setStart(await msg.getDownloadQueue());
		})();
	}, []);

	const change = async () => {
		if (await messageChannel?.isDownloading()) alert('O download atual será concluído antes que a fila pare');
		msg?.setDownloadQueue(!start);
		setStart(!start);
	};

	return (
		<Require value={messageChannel}>
			<Button startIcon={start ? <PauseCircleFilled /> : <PlayCircleFilled />} variant="contained" onClick={change} sx={{ maxHeight: '2.3rem' }}>
				{start ? 'Parar Fila' : 'Iniciar Fila'}
			</Button>
		</Require>
	);
};

export default StartQueueButton;
