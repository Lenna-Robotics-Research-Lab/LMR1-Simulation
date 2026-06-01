<div align="justify">

# LENNA Mobile Robot Simulation

LENNA Mobile Robot is a differential-drive mobile robot platform intended for research and education. The repository maintains equivalent ROS1 and ROS2 simulations to support both legacy and modern robotics workflows.

<p align="center">
  <img src="docs/media/urdf-rviz-visual.png" alt="LMR1 Simulation" width="1080">
</p>

</div>

<table>
<tr>
<td width="50%" valign="top">

<p align="center">
  <img src="docs/media/urdf-viewer.gif" alt="LMR1 Simulation" width="400">
</p>

</td>
<td width="50%" valign="top">

<div align="justify">
  
Use the [`Interactive URDF Viewer`](https://lenna-robotics-research-lab.github.io/LMR1-Simulation/) to load and explore the robot model online. The joint sliders and TF visualizer tools are available from the control panel on the left side of the viewer. 

</div>

> [!NOTE]\
> The LENNA Mobile Robot model may take several seconds to load fully.

</td>
</tr>
</table>

## Repository Structure

    .
    ├── docs/                    # Reading Materials and Figures
    │   └── media/
    │
    ├── web_viewer/
    │   ├── public/              # Files and Figures for the Online Viewer
    │   ├── index.html 
    │   ├── main.html 
    │   ├── package.json 
    │   └── vite.config.js/ 
    │
    ├── lmr1_description/        # ROS1 Package for LMR1 URDF and Simulation
    │   ├── launch/
    │   │   ├── display.launch
    │   │   ├── gazebo.launch
    │   │   └── ...
    │   ├── meshes/              # 3D Meshes in the COLLADA Format
    │   │   ├── base.dae
    │   │   └── wheel.dae
    │   ├── urdf/                # XACRO/URDF Modular Descriptions Files
    │   │   ├── common/
    │   │   ├── components/
    │   │   └── robot.urdf.xacro
    │   ├── CMakeLists.txt
    │   └── package.xml
    │
    └── README.md                # Entry Point, Quick Start


<div align="justify">

## ROS Implementations

<table>
<tr>
<td width="50%" valign="top">

### ROS

[![Static Badge](https://img.shields.io/badge/Ubuntu-20.04_Focal-orange?logo=ubuntu)](https://releases.ubuntu.com/focal/)
[![Static Badge](https://img.shields.io/badge/ROS-Noetic-violet?logo=ros)](http://wiki.ros.org/noetic)
[![Static Badge](https://img.shields.io/badge/Gazebo-Classic-green)](https://classic.gazebosim.org/)
 
The ROS1 version provides a complete simulation environment for the LMR1 platform using the ROS Noetic ecosystem.

#### Quick Start

Copy the `lmr1_description` package from this repository into your ROS workspace and build the package.

```bash
$ catkin build lmr1_description
$ source devel/setup.bash
```

##### 🖥️ RViz Display

To visualize the LMR1 URDF model in RViz, use the `display.launch` file:

```bash
$ roslaunch lmr1_description display.launch
```

##### 🎮 Gazebo Simulation Turtlebot World

To spawn the LMR1 robot in Gazebo using the default TurtleBot world, launch `gazebo.launch`:

```bash
$ roslaunch lmr1_description gazebo.launch
```

##### 🗺️ GMapping SLAM Implementation

You can run `gmapping_slam.launch` to demonstrate the GMapping SLAM algorithm using the LMR1 robot within the TurtleBot world environment.

<p align="center">
  <img src="docs/media/lmr1_slam.gif" alt="LMR1 Simulation" width="400">
</p>


```bash
$ roslaunch lmr1_description gmapping_slam.launch
```

</td>
<td width="50%" valign="top">

### ROS2

[![Static Badge](https://img.shields.io/badge/Ubuntu-22.04_Jammy-orange?logo=ubuntu)](https://releases.ubuntu.com/jammy/)
[![Static Badge](https://img.shields.io/badge/ROS2-Humble-blue?logo=ros)](https://docs.ros.org/en/humble/index.html)
[![Static Badge](https://img.shields.io/badge/Gazebo-Ignition-yellow)](https://gazebosim.org/api/gazebo/6/)

> [!NOTE]\
> UNDER DEVEVLOPMENT!

</td>
</tr>
</table>


## License

Specify your license here.


</div>
