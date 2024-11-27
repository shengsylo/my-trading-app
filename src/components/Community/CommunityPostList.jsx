import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Alert, Nav, Modal, Table } from 'react-bootstrap';
import { CommunityPost, CommunitySettings } from './CommunityComponent/CommunityComponent';
import { Empty, Input, Typography, Space, Card as AntCard, Divider, Badge, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, TeamOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';
import './Community.css';
import '../../styles/style.css';

const { Title, Text } = Typography;
const { Search } = Input;

const CommunityPage = () => {
  const [posts, setPosts] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCommunity, _setSelectedCommunity] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMemberSettings, setShowMemberSettings] = useState(false);
  const [showThePosting, setShowThePosting] = useState(true);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);
  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    is_private: false
  });

  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem('authToken');

  const axiosConfig = {
    headers: { 
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const setSelectedCommunity = async (e) => {
    _setSelectedCommunity(e)
    console.log("selectedCommunity",selectedCommunity)
  }


  const fetchCommunities = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}community/groups/?search=${searchQuery}`,
        axiosConfig
      );
      console.log("fetchCommunities",selectedCommunity)
      setSearchResults(response.data);
    } catch (error) {
      setMessage('Failed to load communities');
      setMessageType('danger');
    }
  }, [API_URL, searchQuery]);

  const fetchUserCommunities = useCallback(async () => {
    try {
      const response = await axios.get(
        `${API_URL}community/groups/`,
        axiosConfig
      );
      setCommunities(response.data.filter(c => (c.is_member || c.is_admin)));
    } catch (error) {
      setMessage('Failed to load user communities');
      setMessageType('danger');
    }
  }, [API_URL]);
  
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const url = selectedCommunity
        ? `${API_URL}community/posts/?community=${selectedCommunity.id}`
        : `${API_URL}community/posts/`;
        
      if (selectedCommunity?.is_private && !selectedCommunity?.is_member) {
        setPosts([]);
        return;
      }
      
      const response = await axios.get(url, axiosConfig);
      console.log("responseresponseresponseresponse",response)
      console.log("selectedCommunity",selectedCommunity)
      setPosts(response.data);
    } catch (error) {
      setMessage('Failed to load posts');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  }, [API_URL, selectedCommunity]);
  // const fetchPosts = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const url = selectedCommunity
  //       ? `${API_URL}community/posts/?community=${selectedCommunity.id}`
  //       : `${API_URL}community/posts/`;
  //     const response = await axios.get(url, axiosConfig);
  //     console.log("response.data",response)
  //     setPosts(response.data);
  //   } catch (error) {
  //     setMessage('Failed to load posts');
  //     setMessageType('danger');
  //   } finally {
  //     setLoading(false);
  //   }
  // }, [API_URL, selectedCommunity]);

  useEffect(() => {
    fetchCommunities();
    fetchUserCommunities();
    fetchPosts();
  }, [fetchCommunities, fetchUserCommunities, fetchPosts]);

  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_URL}community/groups/`,
        newCommunity,
        axiosConfig
      );
      setMessage('Community created successfully!');
      setMessageType('success');
      setShowCreateCommunity(false);
      setNewCommunity({ name: '', description: '', is_private: false });
      fetchUserCommunities();
    } catch (error) {
      setMessage('Failed to create community');
      setMessageType('danger');
    }
  };

  const handleNewPost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setLoading(true);
      const postData = {
        content: newPost,
        community: selectedCommunity?.id
      };
      await axios.post(
        `${API_URL}community/posts/`,
        postData,
        axiosConfig
      );
      setNewPost('');
      setMessage('Post submitted for approval!');
      setMessageType('success');
      await fetchPosts();
    } catch (error) {
      setMessage('Failed to create post');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId) => {
    try {
      await axios.post(
        `${API_URL}community/groups/${communityId}/join/`,
        {},
        axiosConfig
      );
      fetchUserCommunities();
      setMessage('Join community requested successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to join community');
      setMessageType('danger');
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    try {
      await axios.post(
        `${API_URL}community/groups/${communityId}/leave/`,
        {},
        axiosConfig
      );
      fetchUserCommunities();
      setMessage('Left community successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to leave community');
      setMessageType('danger');
    }
  };

  const handleCommunitySetting = async (communityId) => {
    console.log("handleCommunitySetting",communityId)
    try {
      await fetchCommunityMembers(communityId).then(
        setShowSettings(true)
      );
    } catch (error) {
      setMessage('Failed to open community settings.');
      setMessageType('danger');
    }
  };

  const handleMemberSetting = async (communityId) => {
    console.log("handleMemberSetting",communityId)
    try {
      await fetchCommunityMembers(communityId);
      setShowMemberSettings(true);
    } catch (error) {
      setMessage('Failed to open member settings.');
      setMessageType('danger');
    }
  };
  
  const fetchCommunityMembers = async (communityId) => {
    try {
      const response = await axios.get(
        `${API_URL}community/groups/${communityId}/members/`,
        axiosConfig
      );
      setPendingMembers(response.data.filter(member => !member.is_approved));
      setApprovedMembers(response.data.filter(member => member.is_approved));
    } catch (error) {
      setMessage('Failed to load community members');
      setMessageType('danger');
    }
  };

  const handleApproveMember = async (membershipId) => {
    try {
      await axios.post(
        `${API_URL}community/groups/${selectedCommunity.id}/approve_member/`,
        { membership_id: membershipId },
        axiosConfig
      );
      setMessage('Member approved successfully!');
      setMessageType('success');
      fetchCommunityMembers(selectedCommunity.id);
    } catch (error) {
      setMessage('Failed to approve member');
      setMessageType('danger');
    }
  };

  const handleRejectMember = async (membershipId) => {
    try {
      await axios.post(
        `${API_URL}community/groups/${selectedCommunity.id}/remove_member/`,
        { membership_id: membershipId },
        axiosConfig
      );
      setMessage('Member rejected successfully!');
      setMessageType('success');
      fetchCommunityMembers(selectedCommunity.id);
    } catch (error) {
      setMessage('Failed to reject member');
      setMessageType('danger');
    }
  };

  // Add these handlers in your CommunityPage component:
const handleEditPost = async (postId, newContent) => {
  try {
    await axios.put(
      `${API_URL}community/posts/${postId}/update_post/`,
      { content: newContent },
      axiosConfig
    );
    fetchPosts();
    setMessage('Post updated successfully!');
    setMessageType('success');
  } catch (error) {
    setMessage('Failed to update post');
    setMessageType('danger');
  }
};

const handleDeletePost = async (postId) => {
  if (!window.confirm('Are you sure you want to delete this post?')) return;
  
  try {
    await axios.delete(
      `${API_URL}community/posts/${postId}/`,
      axiosConfig
    );
    fetchPosts();
    setMessage('Post deleted successfully!');
    setMessageType('success');
  } catch (error) {
    setMessage('Failed to delete post');
    setMessageType('danger');
  }
};

const handleUpdateCommunity = async (communityId, formData) => {
  try {
    await axios.put(
      `${API_URL}community/groups/${communityId}/`,
      formData,
      axiosConfig
    );
    fetchCommunities();
    setMessage('Community settings updated successfully!');
    setMessageType('success');
  } catch (error) {
    setMessage('Failed to update community settings');
    setMessageType('danger');
  }
};

const handleLike = async (postId) => {
  try {
    const response = await axios.post(
      `${API_URL}community/posts/${postId}/like/`,
      {},  // Add empty object as request body
      axiosConfig
    );
    
    // Update posts state to reflect the new like status
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1,
          is_liked: !post.is_liked
        };
      }
      return post;
    }));

  } catch (error) {
    setMessage('Failed to like post');
    setMessageType('danger');
    console.error('Error liking post:', error);
  }
};

const handleComment = async (postId, content) => {
  try {
    const response = await axios.post(
      `${API_URL}community/posts/${postId}/comment/`,
      { content },
      axiosConfig
    );

    // Update posts state with the new comment
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...(post.comments || []), response.data]
        };
      }
      return post;
    }));

    setMessage('Comment added successfully!');
    setMessageType('success');
  } catch (error) {
    setMessage('Failed to add comment');
    setMessageType('danger');
    console.error('Error adding comment:', error);
  }
};

  const CommunitySettingsModal = () => (
    <Modal 
      show={showMemberSettings} 
      onHide={() => setShowMemberSettings(false)}
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Community Settings - {selectedCommunity?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {message && (
          <Alert variant={messageType} dismissible>
            {message}
          </Alert>
        )}
        
        <h5>Pending Member Requests</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>User</th>
              <th>Joined Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingMembers.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center">No pending requests</td>
              </tr>
            ) : (
              pendingMembers.map((member) => (
                <tr key={member.id}>
                  <td>{member.user.username}</td>
                  <td>{new Date(member.joined_at).toLocaleDateString()}</td>
                  <td>
                    <Button
                      size="sm"
                      className="me-2 btn btn-success"
                      onClick={() => handleApproveMember(member.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      className="btn-danger btn"
                      size="sm"
                      onClick={() => handleRejectMember(member.id)}
                    >
                      Reject
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>

        <h5 className="mt-4">Current Members</h5>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>User</th>
              <th>Joined Date</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvedMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.user.username}</td>
                <td>{new Date(member.joined_at).toLocaleDateString()}</td>
                <td>{member.is_admin ? 'Admin' : 'Member'}</td>
                <td>
                  {!member.is_admin && (
                    <Button
                      className="btn-danger btn"
                      size="sm"
                      onClick={() => handleRejectMember(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>
      <Modal.Footer>
        <Button className="secondary" onClick={() => setShowMemberSettings(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );

  const handleApprovePost = async (postId) => {
    try {
      await axios.post(
        `${API_URL}community/posts/${postId}/approve/`,
        {},
        axiosConfig
      );
      fetchPosts();
      setMessage('Post approved successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to approve post');
      setMessageType('danger');
    }
  };

  const handleRejectPost = async (postId) => {
    try {
      await axios.post(
        `${API_URL}community/posts/${postId}/reject/`,
        {},
        axiosConfig
      );
      fetchPosts();
      setMessage('Post rejected successfully!');
      setMessageType('success');
    } catch (error) {
      setMessage('Failed to reject post');
      setMessageType('danger');
    }
  };

  return (
    <Container fluid className="py-4">
      <Row className="g-3">
        {/* Enhanced Left Sidebar */}
        <Col md={3}>
          <AntCard 
            className="bg-dark shadow-sm border-0 h-100"
            bodyStyle={{ padding: 0 }}
          >
            <div className="p-3 bg-dark ">
              <Search
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSearch={fetchCommunities}
                className="mb-3"
                prefix={<SearchOutlined />}
              />
              <Button
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                variant="light"
                onClick={() => {
                  setShowCreateCommunity(true);
                  setShowSettings(false);
                  setSelectedCommunity(null);
                  setShowThePosting(false);
                }}
              >
                <PlusOutlined /> Create Community
              </Button>
            </div>
            <Divider orientation="center" className='bg-dark  border-0'>
              -
            </Divider>

            {searchResults.length > 0 && searchQuery.length > 0 && (
              <div className="search-results shadow-sm">
                {searchResults.map((community) => (
                  <div
                    key={community.id}
                    className="search-result p-3 border-bottom hover-overlay"
                    onClick={() => {
                      setSelectedCommunity(community);
                      setSearchQuery('');
                    }}
                  >
                    <Space>
                      <TeamOutlined />
                      <span>{community.name}</span>
                    </Space>
                  </div>
                ))}
              </div>
            )}

            <Nav className="flex-column p-2">
              <Nav.Link
                active={!selectedCommunity}
                onClick={() => {
                  setSelectedCommunity(null);
                  setShowThePosting(true);
                  setShowCreateCommunity(false);
                }}
                className="mb-2 rounded"
              >
                <Space>
                  <TeamOutlined /> All Posts
                </Space>
              </Nav.Link>

              <Divider orientation="center" className='bg-dark  border-0'>
                <Text type="secondary" className='text-white'>Joined Communities</Text>
              </Divider>

              {communities.map((community) => (
                <Nav.Link
                  key={community.id}
                  active={selectedCommunity?.id === community.id}
                  onClick={() => {
                    setSelectedCommunity(community);
                    setShowCreateCommunity(false);
                  }}
                  className="d-flex justify-content-between align-items-center mb-2 rounded p-2"
                >
                  <Space>
                    <TeamOutlined />
                    <span>{community.name}</span>
                  </Space>
                  {community.is_admin && (
                    <Badge count="Admin" style={{ backgroundColor: '#52c41a' }} />
                  )}
                </Nav.Link>
              ))}
            </Nav>
          </AntCard>
        </Col>

        {/* Enhanced Main Content */}
        <Col md={9}>
          <div className="mb-4">
            {/* Create Community Form */}
            {showCreateCommunity && (
              <AntCard className="shadow-sm border-0">
                <Title level={4}>Create New Community</Title>
                <Form onSubmit={handleCreateCommunity}>
                  <Form.Group className="mb-3">
                    <Form.Label>Community Name</Form.Label>
                    <Input
                      value={newCommunity.name}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter community name..."
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Input.TextArea
                      rows={3}
                      value={newCommunity.description}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          description: e.target.value,
                        })
                      }
                      placeholder="Provide a description..."
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      label="Private Community"
                      checked={newCommunity.is_private}
                      onChange={(e) =>
                        setNewCommunity({
                          ...newCommunity,
                          is_private: e.target.checked,
                        })
                      }
                    />
                  </Form.Group>

                  <Space>
                    <Button type="submit" variant="primary">
                      Create Community
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowCreateCommunity(false);
                        setShowThePosting(true);
                      }}
                    >
                      Cancel
                    </Button>
                  </Space>
                </Form>
              </AntCard>
            )}

            {/* Community Details */}
            {selectedCommunity && (
              <AntCard className="shadow-sm border-0 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <Title level={4} className="mb-0">{selectedCommunity.name}</Title>
                    <Text type="secondary">
                      {selectedCommunity.member_count} members • Created {new Date(selectedCommunity.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                  <Space>
                    {selectedCommunity.is_admin ? (
                      <>
                        <Tooltip title="Member Settings">
                          <Button
                            variant="outline-primary"
                            onClick={() => handleMemberSetting(selectedCommunity.id)}
                          >
                            <TeamOutlined />
                          </Button>
                        </Tooltip>
                        <Tooltip title="Community Settings">
                          <Button
                            variant="outline-primary"
                            onClick={() => handleCommunitySetting(selectedCommunity.id)}
                          >
                            <SettingOutlined />
                          </Button>
                        </Tooltip>
                      </>
                    ) : selectedCommunity.is_member ? (
                      <Button
                        variant="danger"
                        onClick={() => handleLeaveCommunity(selectedCommunity.id)}
                      >
                        <Space>
                          <LogoutOutlined /> Leave Community
                        </Space>
                      </Button>
                    ) : (
                      <Button
                        variant={selectedCommunity.has_pending_request ? "secondary" : "primary"}
                        disabled={selectedCommunity.has_pending_request}
                        onClick={() => handleJoinCommunity(selectedCommunity.id)}
                      >
                        {selectedCommunity.has_pending_request ? "Pending Approval" : "Join Community"}
                      </Button>
                    )}
                  </Space>
                </div>
                <Text>{selectedCommunity.description}</Text>
              </AntCard>
            )}

            {/* Create Post */}
            {showThePosting && (
              <AntCard className="shadow-sm border-0 mb-4">
                <Title level={5}>
                  {selectedCommunity ? `Post to ${selectedCommunity.name}` : "Create Post"}
                </Title>
                {message && (
                  <Alert variant={messageType} dismissible className="mb-3">
                    {message}
                  </Alert>
                )}
                <Form onSubmit={handleNewPost}>
                  <Form.Group className="mb-3">
                    <Input.TextArea
                      rows={3}
                      placeholder={selectedCommunity ? 
                        `Write something to ${selectedCommunity.name}...` : 
                        "Write something to share..."
                      }
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                    >
                      {selectedCommunity ? 'Submit for Approval' : 'Post'}
                    </Button>
                  </div>
                </Form>
              </AntCard>
            )}

            {/* Posts List */}
            {selectedCommunity?.is_admin && posts.filter(post => !post.is_approved).length > 0 && (
              <AntCard className="shadow-sm border-0 mb-4">
                <Title level={5}>Pending Posts</Title>
                {posts
                  .filter(post => !post.is_approved)
                  .map(post => (
                    <div key={post.id} className="border-bottom p-3">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Text strong>{post.user.username}</Text>
                          <Text className="d-block">{post.content}</Text>
                        </div>
                        <Space>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleApprovePost(post.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectPost(post.id)}
                          >
                            Reject
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ))}
              </AntCard>
            )}

            {/* Approved Posts */}
            {posts.filter(post => post.is_approved).length === 0 ? (
              <AntCard className="shadow-sm border-0 text-center p-4">
                <Empty
                  description="No posts to show"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              </AntCard>
            ) : (
              <div className="posts-container">
                {posts
                  .filter(post => post.is_approved)
                  .map(post => (
                    <CommunityPost
                      key={post.id}
                      post={post}
                      onEdit={handleEditPost}
                      onDelete={handleDeletePost}
                      onLike={handleLike}
                      onComment={handleComment}
                      isAdmin={selectedCommunity?.is_admin}
                      currentUser={token ? token : null}
                    />
                  ))}
              </div>
            )}
          </div>
        </Col>
      </Row>

      {/* Settings Modals */}
      <CommunitySettings
        community={selectedCommunity}
        onUpdate={handleUpdateCommunity}
        show={showSettings}
        onHide={() => setShowSettings(false)}
      />

      <CommunitySettingsModal />
    </Container>
  );
};

export default CommunityPage;
