'use strict';

import React from 'react';
import translate from 'app/global/helper/translate';

import { browserHistory } from 'react-router';
import { Button, Modal, message } from 'antd';

import Helper from 'app/global/helper';
import _ from 'lodash';
import update from 'immutability-helper';

import { graphql } from 'react-apollo';
import DeleteBoardMutation from 'app/graphql/mutations/boards/Delete';
import GetAllBoardsQuery from 'app/graphql/queries/boards/All';

import BoardVisibilityChange from 'app/components/productivity/boards/ChangeVisibility';


const ProductivityHeader = (props) => {

	const gotoBoardEdit = () => {
		browserHistory.push(`/boards/${props.board.id}/edit`);
	}


	const handleBoardDelete = () => {

		const loading_message = message.loading( translate('messages.board.delete.processing') , 0);
		browserHistory.push(`/dashboard`);

		props.mutate({
				variables: { id: props.board.id },
				optimisticResponse: {
					__typename: 'Mutation',
					deleteBoard: {
						__typename: 'Board',
						id: props.board.id,
						status: 10,
					}
				},
				refetchQueries: [{ query: GetAllBoardsQuery }],
				updateQueries: {
					BoardQuery: (previousResult, { mutationResult }) => {
						const deleteBoard = mutationResult.data.deleteBoard;
						return update(previousResult, {
							board: {
								status: {
									$set: deleteBoard.status
								}
							},
						});
					}
				},

			})
			.then( () => {
				loading_message();
				message.success( translate('messages.board.delete.success') );
			});

	}


	const confirmBoardDeletion = () => {
		Modal.confirm({
			title: translate('confirm.common.title'),
			content: translate('confirm.board.delete.description'),
			okText: translate('confirm.yes'),
			cancelText: translate('confirm.no'),

			onOk() {
				handleBoardDelete();
			},
			onCancel() {},
		});
	}




	// check if the background color of the board is: default, light or dark
	const board_background = Helper.ui.detectBackgroundBrightness(props.board.meta.background);
	let header_class = '';
	if ( board_background === 'dark' ) { header_class = 'light'; }
	if ( board_background === 'light' ) { header_class = 'dark'; }
	if ( board_background === 'default' ) { header_class = 'default'; }


	return (
		<header className={`productivity ${ header_class } `}>
			<div className="title">
				{ props.title }
				{ props.description &&
					<span className="description">{ props.description }</span>
				}
			</div>

			{ ! props.public &&
			<div className="flex">
				<BoardVisibilityChange data={props.board} />
				<Button type="primary" icon="edit" className="m-l-10" onClick={ gotoBoardEdit } />
				<Button type="danger" icon="delete" className="m-l-10" onClick={ confirmBoardDeletion } />
			</div>
			}

		</header>
	);

}

// export default ProductivityHeader;
export default graphql(DeleteBoardMutation)(ProductivityHeader);
